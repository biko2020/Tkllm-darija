"""
Speaker Feature Extraction — Tkllm-darija Feature Store
ml/feature-store/speaker/speaker_features.py

Extracts speaker-level features for:
  1. Speaker diarisation (who spoke when)
  2. Speaker embeddings (x-vectors / d-vectors) for deduplication
  3. Acoustic features for dialect classification (MFCCs, prosody)

Used by the quality engine to detect duplicate contributors submitting
the same audio and to flag synthetic / AI-generated recordings.

Usage:
    python ml/feature-store/speaker/speaker_features.py \\
        --audio path/to/recording.wav \\
        --output-dir data/samples/speaker_features
"""

from __future__ import annotations

import argparse
import json
import logging
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
import librosa
import torch

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)-8s %(message)s")


# =============================================================================
# Acoustic Feature Extraction
# =============================================================================

@dataclass
class AcousticFeatures:
    """Speaker-independent acoustic features extracted from an audio segment."""
    # MFCC statistics (mean + std across time)
    mfcc_mean:        list[float]
    mfcc_std:         list[float]
    # Pitch / Prosody
    f0_mean:          float | None   # fundamental frequency (Hz)
    f0_std:           float | None
    f0_min:           float | None
    f0_max:           float | None
    speaking_rate:    float          # syllables per second (approx)
    # Energy
    rms_mean:         float
    rms_std:          float
    # Spectral
    spectral_centroid:float
    spectral_rolloff: float
    spectral_flatness:float
    # Voice quality
    hnr:              float | None   # Harmonics-to-Noise Ratio (dB)
    zcr_mean:         float
    # Duration
    duration_s:       float
    speech_ratio:     float          # fraction of audio that is speech


def extract_acoustic_features(
    audio_path: str,
    sr: int = 16_000,
    n_mfcc: int = 40,
    hop_length: int = 256,
    frame_length: int = 1024,
) -> AcousticFeatures:
    """Extract a comprehensive set of acoustic features from an audio file."""
    y, sr = librosa.load(audio_path, sr=sr, mono=True)
    duration = len(y) / sr

    # ── MFCC ──────────────────────────────────────────────────────────────────
    mfccs = librosa.feature.mfcc(
        y=y, sr=sr, n_mfcc=n_mfcc,
        hop_length=hop_length, n_fft=frame_length
    )
    mfcc_mean = mfccs.mean(axis=1).tolist()
    mfcc_std  = mfccs.std(axis=1).tolist()

    # ── Pitch (F0) ────────────────────────────────────────────────────────────
    try:
        f0, voiced_flag, _ = librosa.pyin(
            y, fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"), sr=sr,
            hop_length=hop_length,
        )
        voiced_f0 = f0[voiced_flag & ~np.isnan(f0)]
        if len(voiced_f0) > 0:
            f0_mean = float(voiced_f0.mean())
            f0_std  = float(voiced_f0.std())
            f0_min  = float(voiced_f0.min())
            f0_max  = float(voiced_f0.max())
        else:
            f0_mean = f0_std = f0_min = f0_max = None
    except Exception:
        f0_mean = f0_std = f0_min = f0_max = None

    # ── Energy / RMS ──────────────────────────────────────────────────────────
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    rms_mean = float(rms.mean())
    rms_std  = float(rms.std())

    # ── Speech ratio (VAD approximation) ─────────────────────────────────────
    energy_threshold = np.percentile(rms, 25)
    speech_ratio = float((rms > energy_threshold).mean())

    # ── Speaking rate approximation (zero-crossing based) ─────────────────────
    # Rough proxy: count voiced segments per second
    zcr = librosa.feature.zero_crossing_rate(y, hop_length=hop_length)[0]
    zcr_mean = float(zcr.mean())
    # Syllable rate approx from RMS envelope peaks
    from scipy.signal import find_peaks
    peaks, _ = find_peaks(rms, height=rms.mean(), distance=sr // hop_length // 4)
    speaking_rate = len(peaks) / max(duration, 0.1)

    # ── Spectral features ─────────────────────────────────────────────────────
    spec_centroid = librosa.feature.spectral_centroid(
        y=y, sr=sr, hop_length=hop_length
    ).mean()
    spec_rolloff = librosa.feature.spectral_rolloff(
        y=y, sr=sr, hop_length=hop_length
    ).mean()
    spec_flatness = librosa.feature.spectral_flatness(
        y=y, hop_length=hop_length
    ).mean()

    # ── HNR (Harmonics-to-Noise Ratio) ────────────────────────────────────────
    # Approximated via autocorrelation
    try:
        autocorr = librosa.autocorrelate(y)
        if autocorr[0] > 0:
            hnr_ratio = autocorr[1] / autocorr[0]
            hnr = float(10 * np.log10(max(hnr_ratio / (1 - hnr_ratio + 1e-10), 1e-10)))
        else:
            hnr = None
    except Exception:
        hnr = None

    return AcousticFeatures(
        mfcc_mean=mfcc_mean,
        mfcc_std=mfcc_std,
        f0_mean=f0_mean,
        f0_std=f0_std,
        f0_min=f0_min,
        f0_max=f0_max,
        speaking_rate=round(speaking_rate, 3),
        rms_mean=round(rms_mean, 6),
        rms_std=round(rms_std, 6),
        spectral_centroid=round(float(spec_centroid), 2),
        spectral_rolloff=round(float(spec_rolloff), 2),
        spectral_flatness=round(float(spec_flatness), 6),
        hnr=round(hnr, 2) if hnr is not None else None,
        zcr_mean=round(zcr_mean, 6),
        duration_s=round(duration, 3),
        speech_ratio=round(speech_ratio, 3),
    )


# =============================================================================
# Speaker Diarisation
# =============================================================================

def diarise_audio(audio_path: str, hf_token: str | None = None) -> list[dict]:
    """
    Run speaker diarisation using pyannote.audio.

    Returns a list of segments: [{start, end, speaker}]

    Requires: pip install pyannote.audio
    HuggingFace token needed to download pyannote models.
    """
    try:
        from pyannote.audio import Pipeline as PyannotePipeline
    except ImportError:
        log.warning("pyannote.audio not installed — skipping diarisation")
        return []

    token = hf_token or os.getenv("HUGGINGFACE_TOKEN")
    pipeline = PyannotePipeline.from_pretrained(
        "pyannote/speaker-diarization-3.1",
        use_auth_token=token,
    )

    if torch.cuda.is_available():
        pipeline = pipeline.to(torch.device("cuda"))

    diarisation = pipeline(audio_path)
    segments = [
        {
            "start":   round(turn.start, 3),
            "end":     round(turn.end, 3),
            "speaker": speaker,
            "duration": round(turn.end - turn.start, 3),
        }
        for turn, _, speaker in diarisation.itertracks(yield_label=True)
    ]
    return segments


def count_speakers(segments: list[dict]) -> int:
    """Return the number of unique speakers detected."""
    return len({s["speaker"] for s in segments})


def is_single_speaker(segments: list[dict], tolerance: float = 0.05) -> bool:
    """Check if the recording is effectively a single speaker (>95% of time)."""
    if not segments:
        return True
    total_duration = sum(s["duration"] for s in segments)
    speaker_times: dict[str, float] = {}
    for seg in segments:
        speaker_times[seg["speaker"]] = (
            speaker_times.get(seg["speaker"], 0) + seg["duration"]
        )
    dominant_speaker_time = max(speaker_times.values())
    return dominant_speaker_time / total_duration >= (1 - tolerance)


# =============================================================================
# Speaker Embedding (x-vector / ECAPA-TDNN)
# =============================================================================

def extract_speaker_embedding(audio_path: str) -> np.ndarray | None:
    """
    Extract a speaker embedding using SpeechBrain ECAPA-TDNN.
    Used for speaker deduplication — detects if the same person
    submitted multiple recordings under different accounts.

    Returns: 192-dim L2-normalised speaker embedding
    """
    try:
        from speechbrain.inference.speaker import EncoderClassifier

        classifier = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            savedir="pretrained_models/spkrec-ecapa-voxceleb",
        )
        waveform, sr = classifier.load_audio(audio_path)
        embedding = classifier.encode_batch(waveform.unsqueeze(0))
        embedding = embedding.squeeze().cpu().numpy()

        # L2 normalise
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        return embedding.astype(np.float32)

    except Exception as exc:
        log.warning("Speaker embedding extraction failed: %s", exc)
        return None


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two L2-normalised vectors."""
    return float(np.dot(a, b))


def is_same_speaker(
    embedding_a: np.ndarray,
    embedding_b: np.ndarray,
    threshold: float = 0.85,
) -> bool:
    """Determine if two recordings are from the same speaker."""
    sim = cosine_similarity(embedding_a, embedding_b)
    return sim >= threshold


# =============================================================================
# Main
# =============================================================================

import os

def main() -> None:
    parser = argparse.ArgumentParser(description="Extract speaker features from audio")
    parser.add_argument("--audio",      required=True, help="Path to audio file")
    parser.add_argument("--output-dir", default="data/samples/speaker_features")
    parser.add_argument("--diarise",    action="store_true", help="Run speaker diarisation")
    parser.add_argument("--embed",      action="store_true", help="Extract speaker embedding")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    audio_name = Path(args.audio).stem

    # Acoustic features
    log.info("Extracting acoustic features from %s", args.audio)
    features = extract_acoustic_features(args.audio)
    features_path = output_dir / f"{audio_name}_acoustic.json"
    with open(features_path, "w") as f:
        json.dump(asdict(features), f, indent=2)
    log.info("Acoustic features saved to %s", features_path)
    print(f"\nDuration: {features.duration_s:.1f}s")
    print(f"Speech ratio: {features.speech_ratio:.1%}")
    print(f"F0 mean: {features.f0_mean:.1f} Hz" if features.f0_mean else "F0: not detected")
    print(f"Speaking rate: {features.speaking_rate:.1f} syllables/s")
    print(f"HNR: {features.hnr:.1f} dB" if features.hnr else "HNR: not computed")

    # Diarisation
    if args.diarise:
        log.info("Running speaker diarisation...")
        segments = diarise_audio(args.audio)
        n_speakers = count_speakers(segments)
        single = is_single_speaker(segments)
        log.info("Speakers detected: %d | Single speaker: %s", n_speakers, single)
        seg_path = output_dir / f"{audio_name}_diarisation.json"
        with open(seg_path, "w") as f:
            json.dump({"n_speakers": n_speakers, "single_speaker": single,
                       "segments": segments}, f, indent=2)

    # Speaker embedding
    if args.embed:
        log.info("Extracting speaker embedding...")
        embedding = extract_speaker_embedding(args.audio)
        if embedding is not None:
            np.save(output_dir / f"{audio_name}_speaker.npy", embedding)
            log.info("Speaker embedding saved: shape=%s", embedding.shape)


if __name__ == "__main__":
    main()