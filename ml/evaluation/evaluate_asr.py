"""
ASR Evaluation Suite — Tkllm-darija
ml/evaluation/evaluate_asr.py

Evaluates a fine-tuned Whisper model on the Darija test set.
Reports WER, CER, RTF broken down by dialect, domain, gender, and region.
Results are logged to MLflow and exported as a Parquet report.

Usage:
    python ml/evaluation/evaluate_asr.py \\
        --model-path ml/experiments/tracking/whisper-small-darija \\
        --test-manifest data/samples/test_manifest.jsonl \\
        --output-dir data/samples/eval_results

    # Evaluate against a HuggingFace Hub model
    python ml/evaluation/evaluate_asr.py \\
        --model-path biko2020/whisper-small-darija \\
        --test-manifest data/samples/test_manifest.jsonl
"""

from __future__ import annotations

import argparse
import json
import logging
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator

import evaluate
import mlflow
import numpy as np
import pandas as pd
import torch
from faster_whisper import WhisperModel
from jiwer import process_words
from tqdm.auto import tqdm

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("evaluate_asr")

# ── Normalisation ─────────────────────────────────────────────────────────────

import re

def normalise_arabic(text: str) -> str:
    """Normalise Arabic text for fair WER comparison."""
    text = re.sub(r"[\u064B-\u065F\u0670]", "", text)  # Remove diacritics
    text = re.sub(r"[أإآ]", "ا", text)                  # Normalise Alef
    text = re.sub(r"ة", "ه", text)                       # Normalise Tah Marbuta
    text = re.sub(r"ى", "ي", text)                       # Normalise Alef Maqsura
    text = re.sub(r"[،,.؟?!؛;:\-–—()[\]{}\"\'«»]", "", text)  # Remove punctuation
    text = re.sub(r"\s+", " ", text)                     # Collapse whitespace
    return text.strip().lower()


def normalise_arabizi(text: str) -> str:
    """Normalise Arabizi (Latin-script Darija) for WER."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# ── Data Loading ──────────────────────────────────────────────────────────────

@dataclass
class TestSample:
    audio_path: str
    reference: str
    dialect: str = "unknown"
    domain: str = "unknown"
    gender: str = "unknown"
    region: str = "unknown"
    language: str = "darija"
    duration_s: float = 0.0


def load_test_manifest(manifest_path: str) -> list[TestSample]:
    """Load test samples from a JSONL manifest file."""
    samples = []
    with open(manifest_path, encoding="utf-8") as f:
        for line in f:
            data = json.loads(line.strip())
            samples.append(TestSample(
                audio_path=data["audio_path"],
                reference=data.get("transcript", data.get("reference", "")),
                dialect=data.get("dialect", "unknown"),
                domain=data.get("domain", "unknown"),
                gender=data.get("gender", "unknown"),
                region=data.get("region", "unknown"),
                language=data.get("language", "darija"),
                duration_s=data.get("duration_s", 0.0),
            ))
    log.info("Loaded %d test samples from %s", len(samples), manifest_path)
    return samples


# ── Transcription ─────────────────────────────────────────────────────────────

def transcribe_samples(
    model: WhisperModel,
    samples: list[TestSample],
    audio_root: Path,
    language: str = "ar",
    beam_size: int = 5,
    vad_filter: bool = True,
) -> Iterator[dict]:
    """Transcribe all test samples and yield result dicts."""
    for sample in tqdm(samples, desc="Transcribing"):
        audio_path = audio_root / sample.audio_path
        if not audio_path.exists():
            log.warning("Audio not found: %s — skipping", audio_path)
            continue

        t0 = time.perf_counter()
        try:
            segments, info = model.transcribe(
                str(audio_path),
                language=language,
                beam_size=beam_size,
                vad_filter=vad_filter,
            )
            hypothesis = " ".join(seg.text.strip() for seg in segments)
            elapsed = time.perf_counter() - t0
            error = None
        except Exception as exc:
            hypothesis = ""
            elapsed = time.perf_counter() - t0
            error = str(exc)
            info = None
            log.warning("Transcription failed for %s: %s", sample.audio_path, exc)

        # Normalise both sides
        ref_norm  = normalise_arabic(sample.reference)
        hyp_norm  = normalise_arabic(hypothesis)

        # Compute WER / CER
        if ref_norm and hyp_norm:
            try:
                wer_score = evaluate.load("wer").compute(
                    predictions=[hyp_norm], references=[ref_norm]
                )
                cer_score = evaluate.load("cer").compute(
                    predictions=[hyp_norm], references=[ref_norm]
                )
            except Exception:
                wer_score = 1.0
                cer_score = 1.0
        elif not ref_norm:
            wer_score = cer_score = None
        else:
            wer_score = 1.0
            cer_score = 1.0

        rtf = elapsed / max(sample.duration_s, 0.1) if sample.duration_s > 0 else None

        yield {
            "audio_path":    sample.audio_path,
            "dialect":       sample.dialect,
            "domain":        sample.domain,
            "gender":        sample.gender,
            "region":        sample.region,
            "language":      sample.language,
            "duration_s":    sample.duration_s,
            "reference":     sample.reference,
            "hypothesis":    hypothesis,
            "ref_normalised":ref_norm,
            "hyp_normalised":hyp_norm,
            "wer":           round(wer_score, 4) if wer_score is not None else None,
            "cer":           round(cer_score, 4) if cer_score is not None else None,
            "rtf":           round(rtf, 3) if rtf is not None else None,
            "elapsed_s":     round(elapsed, 3),
            "detected_lang": info.language if info else None,
            "lang_prob":     round(info.language_probability, 3) if info else None,
            "error":         error,
        }


# ── Reporting ─────────────────────────────────────────────────────────────────

def build_report(df: pd.DataFrame) -> dict:
    """Build a structured evaluation report from result rows."""
    df_valid = df.dropna(subset=["wer"])

    def slice_metrics(group_col: str) -> dict:
        return (
            df_valid.groupby(group_col)
            .agg(
                wer=("wer", "mean"),
                cer=("cer", "mean"),
                rtf=("rtf", "mean"),
                n=("audio_path", "count"),
                hours=("duration_s", lambda x: x.sum() / 3600),
            )
            .round(4)
            .to_dict(orient="index")
        )

    return {
        "overall": {
            "wer":       round(df_valid["wer"].mean(), 4),
            "cer":       round(df_valid["cer"].mean(), 4),
            "rtf":       round(df_valid["rtf"].mean(), 4),
            "n_samples": len(df_valid),
            "n_errors":  df["error"].notna().sum(),
            "total_hours": round(df_valid["duration_s"].sum() / 3600, 2),
        },
        "by_dialect": slice_metrics("dialect"),
        "by_domain":  slice_metrics("domain"),
        "by_gender":  slice_metrics("gender"),
        "by_region":  slice_metrics("region"),
        "by_language":slice_metrics("language"),
    }


def print_report(report: dict) -> None:
    """Pretty-print the evaluation report."""
    print("\n" + "=" * 60)
    print("  ASR EVALUATION REPORT — Tkllm-darija")
    print("=" * 60)

    ov = report["overall"]
    print(f"\nOverall WER:   {ov['wer']*100:6.2f}%")
    print(f"Overall CER:   {ov['cer']*100:6.2f}%")
    print(f"Avg RTF:       {ov['rtf']:6.3f}")
    print(f"Total samples: {ov['n_samples']:6,}")
    print(f"Total hours:   {ov['total_hours']:6.2f} h")
    print(f"Errors:        {ov['n_errors']:6,}")

    for slice_name in ["by_dialect", "by_domain", "by_gender"]:
        print(f"\n{slice_name.replace('by_', 'WER by ').title()}:")
        print(f"  {'Category':<20} {'WER':>8} {'CER':>8} {'N':>6}")
        print(f"  {'-'*44}")
        for cat, metrics in sorted(report[slice_name].items(),
                                    key=lambda x: x[1]["wer"]):
            print(f"  {cat:<20} {metrics['wer']*100:>7.2f}% {metrics['cer']*100:>7.2f}%"
                  f" {metrics['n']:>6,}")

    print("\n" + "=" * 60)


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate ASR model on Darija test set")
    parser.add_argument("--model-path",    required=True,  help="Model path or HF Hub ID")
    parser.add_argument("--test-manifest", required=True,  help="Path to test JSONL manifest")
    parser.add_argument("--audio-root",    default=".",    help="Root dir for audio files")
    parser.add_argument("--output-dir",    default="data/samples/eval_results")
    parser.add_argument("--language",      default="ar")
    parser.add_argument("--beam-size",     type=int, default=5)
    parser.add_argument("--device",        default="auto",
                        choices=["auto", "cpu", "cuda"])
    parser.add_argument("--compute-type",  default="auto",
                        choices=["auto", "int8", "float16", "float32"])
    parser.add_argument("--mlflow-uri",    default="http://localhost:5000")
    parser.add_argument("--run-name",      default="asr-evaluation")
    args = parser.parse_args()

    # Device selection
    device = args.device
    if device == "auto":
        device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = args.compute_type
    if compute_type == "auto":
        compute_type = "float16" if device == "cuda" else "int8"

    log.info("Device: %s | Compute type: %s", device, compute_type)

    # Load model
    log.info("Loading model: %s", args.model_path)
    model = WhisperModel(args.model_path, device=device, compute_type=compute_type)

    # Load test data
    samples = load_test_manifest(args.test_manifest)
    audio_root = Path(args.audio_root)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # MLflow run
    mlflow.set_tracking_uri(args.mlflow_uri)
    mlflow.set_experiment("tkllm-darija-evaluation")

    with mlflow.start_run(run_name=args.run_name) as run:
        log.info("MLflow run ID: %s", run.info.run_id)
        mlflow.log_param("model_path",    args.model_path)
        mlflow.log_param("n_test_samples", len(samples))
        mlflow.log_param("language",      args.language)
        mlflow.log_param("beam_size",     args.beam_size)
        mlflow.log_param("device",        device)
        mlflow.log_param("compute_type",  compute_type)

        # Transcribe
        results = list(transcribe_samples(
            model, samples, audio_root,
            language=args.language,
            beam_size=args.beam_size,
        ))

        df = pd.DataFrame(results)
        df.to_parquet(output_dir / "eval_results.parquet", index=False)
        log.info("Saved raw results: %s", output_dir / "eval_results.parquet")

        # Build and log report
        report = build_report(df)
        print_report(report)

        report_path = output_dir / "eval_report.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        # Log metrics to MLflow
        mlflow.log_metric("wer_overall",    report["overall"]["wer"])
        mlflow.log_metric("cer_overall",    report["overall"]["cer"])
        mlflow.log_metric("rtf_avg",        report["overall"]["rtf"])
        mlflow.log_artifact(str(report_path))
        mlflow.log_artifact(str(output_dir / "eval_results.parquet"))

        log.info("Evaluation complete. WER: %.4f  CER: %.4f",
                 report["overall"]["wer"], report["overall"]["cer"])


if __name__ == "__main__":
    main()