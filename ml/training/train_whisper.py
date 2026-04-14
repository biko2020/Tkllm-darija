"""
Whisper Fine-tuning Script — Moroccan Darija
ml/training/train_whisper.py

Fine-tunes OpenAI Whisper (small → large-v3) on the Tkllm-darija annotated
dataset using HuggingFace Transformers + Accelerate.

Usage:
    python ml/training/train_whisper.py --config ml/training/configs/whisper_small.yaml
    python ml/training/train_whisper.py --config ml/training/configs/whisper_large.yaml --resume

Requirements:
    pip install -r ml/requirements.txt
    CUDA 12.1+ recommended for large-v3.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

import evaluate
import mlflow
import numpy as np
import torch
import yaml
from accelerate import Accelerator
from datasets import Audio, Dataset, DatasetDict, load_dataset
from transformers import (
    EarlyStoppingCallback,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    WhisperFeatureExtractor,
    WhisperForConditionalGeneration,
    WhisperProcessor,
    WhisperTokenizer,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("train_whisper")


# =============================================================================
# Configuration
# =============================================================================

@dataclass
class WhisperTrainingConfig:
    """All training hyperparameters. Loaded from YAML config file."""

    # Model
    model_name_or_path: str = "openai/whisper-small"
    language: str = "arabic"
    task: str = "transcribe"

    # Data
    dataset_path: str = "../data/versions/v1"
    train_split: str = "train"
    eval_split: str = "validation"
    test_split: str = "test"
    max_train_samples: int | None = None
    max_eval_samples: int | None = None
    audio_column: str = "audio"
    text_column: str = "transcript"
    sampling_rate: int = 16_000
    max_input_length: float = 30.0  # seconds

    # Training
    output_dir: str = "../ml/experiments/tracking/whisper-darija"
    num_train_epochs: int = 10
    per_device_train_batch_size: int = 16
    per_device_eval_batch_size: int = 8
    gradient_accumulation_steps: int = 2
    learning_rate: float = 1e-5
    warmup_steps: int = 500
    weight_decay: float = 0.01
    max_grad_norm: float = 1.0
    fp16: bool = True
    bf16: bool = False
    dataloader_num_workers: int = 4

    # Evaluation
    eval_strategy: str = "epoch"
    save_strategy: str = "epoch"
    load_best_model_at_end: bool = True
    metric_for_best_model: str = "wer"
    greater_is_better: bool = False
    early_stopping_patience: int = 3

    # Generation
    predict_with_generate: bool = True
    generation_max_length: int = 225
    num_beams: int = 5

    # Logging
    logging_steps: int = 25
    report_to: list[str] = field(default_factory=lambda: ["mlflow"])
    run_name: str = "whisper-darija-finetune"

    # MLflow
    mlflow_tracking_uri: str = "http://localhost:5000"
    mlflow_experiment_name: str = "tkllm-darija-asr"

    # W&B (alternative)
    wandb_project: str = "tkllm-darija"
    wandb_entity: str = ""

    # DVC
    dvc_remote: str = "s3://tkllm-datasets/dvc"

    @classmethod
    def from_yaml(cls, path: str) -> "WhisperTrainingConfig":
        with open(path) as f:
            data = yaml.safe_load(f)
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


# =============================================================================
# Data Processing
# =============================================================================

class DarijaDataProcessor:
    """Prepares audio + transcript data for Whisper fine-tuning."""

    def __init__(self, processor: WhisperProcessor, config: WhisperTrainingConfig) -> None:
        self.processor = processor
        self.config = config
        self.feature_extractor = processor.feature_extractor
        self.tokenizer = processor.tokenizer

    def prepare_dataset(self, batch: dict[str, Any]) -> dict[str, Any]:
        """Convert raw audio + text into model inputs."""
        # Load audio at correct sample rate
        audio = batch[self.config.audio_column]
        if isinstance(audio, dict):
            # HuggingFace Audio format
            array = audio["array"]
            sr = audio["sampling_rate"]
        else:
            array = audio
            sr = self.config.sampling_rate

        # Compute log-mel spectrogram
        batch["input_features"] = self.feature_extractor(
            array, sampling_rate=sr
        ).input_features[0]

        # Tokenize transcript
        batch["labels"] = self.tokenizer(
            batch[self.config.text_column]
        ).input_ids

        return batch

    def filter_long_audio(self, batch: dict[str, Any]) -> bool:
        """Filter out recordings longer than max_input_length."""
        audio = batch[self.config.audio_column]
        array = audio["array"] if isinstance(audio, dict) else audio
        sr = audio.get("sampling_rate", self.config.sampling_rate) if isinstance(audio, dict) else self.config.sampling_rate
        duration = len(array) / sr
        return duration <= self.config.max_input_length

    def filter_empty_transcript(self, batch: dict[str, Any]) -> bool:
        """Filter out empty transcripts."""
        text = batch.get(self.config.text_column, "").strip()
        return len(text) > 2


@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    """Pad input features and labels to the same length in a batch."""

    processor: WhisperProcessor
    decoder_start_token_id: int

    def __call__(self, features: list[dict[str, Any]]) -> dict[str, torch.Tensor]:
        # Pad audio features
        input_features = [{"input_features": f["input_features"]} for f in features]
        batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")

        # Pad labels
        label_features = [{"input_ids": f["labels"]} for f in features]
        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        # Replace padding with -100 so loss ignores it
        labels = labels_batch["input_ids"].masked_fill(
            labels_batch.attention_mask.ne(1), -100
        )

        # Remove BOS token if present
        if (labels[:, 0] == self.decoder_start_token_id).all().cpu().item():
            labels = labels[:, 1:]

        batch["labels"] = labels
        return batch


# =============================================================================
# Training
# =============================================================================

def load_datasets(config: WhisperTrainingConfig) -> DatasetDict:
    """Load and preprocess datasets."""
    dataset_path = Path(config.dataset_path)

    if dataset_path.exists() and any(dataset_path.glob("*.parquet")):
        log.info("Loading local Parquet dataset from %s", dataset_path)
        ds = DatasetDict({
            "train":      Dataset.from_parquet(str(dataset_path / "train.parquet")),
            "validation": Dataset.from_parquet(str(dataset_path / "validation.parquet")),
            "test":       Dataset.from_parquet(str(dataset_path / "test.parquet")),
        })
    else:
        # Fall back to DODa / DVoice from HuggingFace Hub
        log.info("Local dataset not found — loading DODa from HuggingFace Hub")
        ds = load_dataset("DODa-10k", trust_remote_code=True)

    # Cast audio column
    ds = ds.cast_column(config.audio_column, Audio(sampling_rate=config.sampling_rate))

    log.info(
        "Dataset: train=%d, validation=%d, test=%d",
        len(ds["train"]), len(ds["validation"]), len(ds["test"]),
    )
    return ds


def compute_metrics(pred: Any, tokenizer: WhisperTokenizer) -> dict[str, float]:
    """Compute WER on decoded predictions."""
    metric = evaluate.load("wer")

    pred_ids   = pred.predictions
    label_ids  = pred.label_ids
    label_ids  = np.where(label_ids != -100, label_ids, tokenizer.pad_token_id)

    pred_str  = tokenizer.batch_decode(pred_ids,  skip_special_tokens=True)
    label_str = tokenizer.batch_decode(label_ids, skip_special_tokens=True)

    # Normalise Arabic text
    pred_str  = [normalise_arabic(t) for t in pred_str]
    label_str = [normalise_arabic(t) for t in label_str]

    wer_score = metric.compute(predictions=pred_str, references=label_str)
    return {"wer": round(wer_score, 4)}


def normalise_arabic(text: str) -> str:
    """Minimal Arabic text normalisation for WER computation."""
    import re
    # Remove diacritics (tashkeel)
    text = re.sub(r"[\u064B-\u065F\u0670]", "", text)
    # Normalise Alef variants
    text = re.sub(r"[أإآ]", "ا", text)
    # Normalise Tah Marbuta
    text = re.sub(r"ة", "ه", text)
    # Remove punctuation
    text = re.sub(r"[^\w\s]", "", text)
    return text.strip()


def train(config: WhisperTrainingConfig) -> None:
    """Main training loop."""
    log.info("=== Tkllm-darija Whisper Fine-tuning ===")
    log.info("Model:      %s", config.model_name_or_path)
    log.info("Output dir: %s", config.output_dir)

    # ── MLflow ───────────────────────────────────────────────────────────────
    mlflow.set_tracking_uri(config.mlflow_tracking_uri)
    mlflow.set_experiment(config.mlflow_experiment_name)

    with mlflow.start_run(run_name=config.run_name) as run:
        log.info("MLflow run ID: %s", run.info.run_id)
        mlflow.log_params(asdict(config))

        # ── Model & processor ─────────────────────────────────────────────
        log.info("Loading model and processor...")
        processor = WhisperProcessor.from_pretrained(
            config.model_name_or_path,
            language=config.language,
            task=config.task,
        )
        model = WhisperForConditionalGeneration.from_pretrained(
            config.model_name_or_path
        )
        model.generation_config.language = config.language
        model.generation_config.task     = config.task
        model.generation_config.forced_decoder_ids = None

        # ── Dataset ───────────────────────────────────────────────────────
        log.info("Loading dataset...")
        raw_datasets = load_datasets(config)
        data_processor = DarijaDataProcessor(processor, config)

        for split in ["train", "validation"]:
            raw_datasets[split] = raw_datasets[split].filter(
                data_processor.filter_long_audio,
                desc=f"Filtering long audio [{split}]",
            )
            raw_datasets[split] = raw_datasets[split].filter(
                data_processor.filter_empty_transcript,
                desc=f"Filtering empty transcripts [{split}]",
            )
            raw_datasets[split] = raw_datasets[split].map(
                data_processor.prepare_dataset,
                remove_columns=raw_datasets[split].column_names,
                num_proc=config.dataloader_num_workers,
                desc=f"Preparing features [{split}]",
            )

            if split == "train" and config.max_train_samples:
                raw_datasets[split] = raw_datasets[split].select(
                    range(config.max_train_samples)
                )

        # ── Data collator ─────────────────────────────────────────────────
        data_collator = DataCollatorSpeechSeq2SeqWithPadding(
            processor=processor,
            decoder_start_token_id=model.config.decoder_start_token_id,
        )

        # ── Training arguments ────────────────────────────────────────────
        training_args = Seq2SeqTrainingArguments(
            output_dir=config.output_dir,
            num_train_epochs=config.num_train_epochs,
            per_device_train_batch_size=config.per_device_train_batch_size,
            per_device_eval_batch_size=config.per_device_eval_batch_size,
            gradient_accumulation_steps=config.gradient_accumulation_steps,
            learning_rate=config.learning_rate,
            warmup_steps=config.warmup_steps,
            weight_decay=config.weight_decay,
            max_grad_norm=config.max_grad_norm,
            fp16=config.fp16 and torch.cuda.is_available(),
            bf16=config.bf16,
            predict_with_generate=config.predict_with_generate,
            generation_max_length=config.generation_max_length,
            eval_strategy=config.eval_strategy,
            save_strategy=config.save_strategy,
            load_best_model_at_end=config.load_best_model_at_end,
            metric_for_best_model=config.metric_for_best_model,
            greater_is_better=config.greater_is_better,
            logging_steps=config.logging_steps,
            report_to=config.report_to,
            run_name=config.run_name,
            dataloader_num_workers=config.dataloader_num_workers,
            push_to_hub=False,
        )

        # ── Trainer ───────────────────────────────────────────────────────
        trainer = Seq2SeqTrainer(
            args=training_args,
            model=model,
            train_dataset=raw_datasets["train"],
            eval_dataset=raw_datasets["validation"],
            data_collator=data_collator,
            compute_metrics=lambda pred: compute_metrics(pred, processor.tokenizer),
            processing_class=processor.feature_extractor,
            callbacks=[EarlyStoppingCallback(
                early_stopping_patience=config.early_stopping_patience
            )],
        )

        log.info("Starting training...")
        train_result = trainer.train()

        # ── Save ──────────────────────────────────────────────────────────
        trainer.save_model()
        processor.save_pretrained(config.output_dir)

        # Log final metrics to MLflow
        mlflow.log_metrics({
            "train_loss":    train_result.training_loss,
            "train_runtime": train_result.metrics.get("train_runtime", 0),
        })

        # ── Evaluate on test set ──────────────────────────────────────────
        log.info("Evaluating on test set...")
        test_ds = raw_datasets.get("test")
        if test_ds:
            test_result = trainer.evaluate(test_ds, metric_key_prefix="test")
            mlflow.log_metrics(test_result)
            log.info("Test WER: %.4f", test_result.get("test_wer", -1))

        # Save config
        config_path = Path(config.output_dir) / "training_config.json"
        config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(config_path, "w") as f:
            json.dump(asdict(config), f, indent=2)
        mlflow.log_artifact(str(config_path))

        log.info("Training complete. Model saved to %s", config.output_dir)


# =============================================================================
# Entry point
# =============================================================================

def main() -> None:
    parser = argparse.ArgumentParser(description="Fine-tune Whisper on Moroccan Darija")
    parser.add_argument("--config", type=str, required=True,
                        help="Path to YAML training config file")
    parser.add_argument("--resume", action="store_true",
                        help="Resume from the last checkpoint in output_dir")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate config and data loading without training")
    args = parser.parse_args()

    config = WhisperTrainingConfig.from_yaml(args.config)
    log.info("Config loaded from %s", args.config)

    if args.dry_run:
        log.info("Dry-run mode — validating config and data loading only")
        raw_datasets = load_datasets(config)
        log.info("Dataset loaded successfully: %s", raw_datasets)
        log.info("Config: %s", asdict(config))
        return

    train(config)


if __name__ == "__main__":
    main()