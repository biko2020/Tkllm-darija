"""
Embedding Computation — Tkllm-darija Feature Store
ml/feature-store/embeddings/compute_embeddings.py

Computes and stores:
  - Audio embeddings (Whisper encoder hidden states)
  - Text embeddings (sentence-transformers Arabic model)
  - Cross-modal embeddings for audio-text alignment

Stored in Pinecone / Weaviate for semantic search and active learning.

Usage:
    python ml/feature-store/embeddings/compute_embeddings.py \\
        --mode audio \\
        --input-manifest data/samples/approved_manifest.jsonl \\
        --store pinecone

    python ml/feature-store/embeddings/compute_embeddings.py \\
        --mode text \\
        --input-manifest data/samples/approved_manifest.jsonl \\
        --store weaviate
"""

from __future__ import annotations

import argparse
import json
import logging
import os
from pathlib import Path
from typing import Any

import numpy as np
import torch
from tqdm.auto import tqdm
from transformers import WhisperFeatureExtractor, WhisperModel

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)-8s %(message)s")

# ── Constants ─────────────────────────────────────────────────────────────────
WHISPER_EMBED_DIM  = 1024   # large-v3 encoder output dim
TEXT_EMBED_DIM     = 768    # Arabic sentence-transformer dim
PINECONE_INDEX     = os.getenv("PINECONE_INDEX_NAME", "tkllm-darija-embeddings")
WEAVIATE_CLASS     = os.getenv("WEAVIATE_CLASS_NAME", "DarijaEmbedding")


# =============================================================================
# Audio Embeddings
# =============================================================================

class WhisperAudioEmbedder:
    """Extracts mean-pooled Whisper encoder embeddings from audio files."""

    def __init__(
        self,
        model_name: str = "openai/whisper-large-v3",
        device: str = "auto",
        layer: int = -1,
    ) -> None:
        self.device = "cuda" if (device == "auto" and torch.cuda.is_available()) else device
        self.layer  = layer

        log.info("Loading Whisper encoder: %s on %s", model_name, self.device)
        self.feature_extractor = WhisperFeatureExtractor.from_pretrained(model_name)
        self.model = WhisperModel.from_pretrained(model_name).encoder.to(self.device)
        self.model.eval()

    @torch.inference_mode()
    def embed(self, audio_array: np.ndarray, sr: int = 16_000) -> np.ndarray:
        """Return mean-pooled encoder embedding for a single audio array."""
        inputs = self.feature_extractor(
            audio_array, sampling_rate=sr, return_tensors="pt"
        )
        input_features = inputs.input_features.to(self.device)

        outputs = self.model(input_features, output_hidden_states=True)
        # Use the specified layer (default -1 = last)
        hidden = outputs.hidden_states[self.layer]    # (1, T, D)
        embedding = hidden.mean(dim=1).squeeze().cpu().numpy()   # (D,)

        # L2-normalise for cosine similarity
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        return embedding.astype(np.float32)

    def embed_batch(
        self,
        samples: list[dict],
        audio_root: Path,
        batch_size: int = 8,
    ) -> list[dict]:
        """Embed a list of sample dicts, returning [{id, embedding, metadata}]."""
        import librosa
        results = []

        for i in tqdm(range(0, len(samples), batch_size), desc="Audio embeddings"):
            batch = samples[i : i + batch_size]
            for sample in batch:
                audio_path = audio_root / sample["audio_path"]
                try:
                    audio, sr = librosa.load(str(audio_path), sr=16_000, mono=True)
                    embedding = self.embed(audio, sr)
                    results.append({
                        "id":        sample["audio_id"],
                        "embedding": embedding.tolist(),
                        "metadata": {
                            "dialect":  sample.get("dialect", "unknown"),
                            "domain":   sample.get("domain",  "unknown"),
                            "gender":   sample.get("gender",  "unknown"),
                            "region":   sample.get("region",  "unknown"),
                            "language": sample.get("language","darija"),
                            "type":     "audio",
                        },
                    })
                except Exception as exc:
                    log.warning("Failed to embed %s: %s", sample["audio_path"], exc)

        return results


# =============================================================================
# Text Embeddings
# =============================================================================

class DarijaTextEmbedder:
    """
    Embeds Darija / Arabic transcripts using sentence-transformers.
    Uses CAMeL BERT or multilingual-e5 as the backbone.
    """

    # Best available models for Moroccan Arabic text:
    # 1. "CAMeL-Lab/bert-base-arabic-camelbert-msa-sentiment" (MSA BERT)
    # 2. "intfloat/multilingual-e5-large" (multilingual, handles Darija reasonably)
    # 3. "silma-ai/SILMA-Arabiya-Instruct-v1.0" (Arabic instruction model)
    DEFAULT_MODEL = "intfloat/multilingual-e5-large"

    def __init__(self, model_name: str | None = None, device: str = "auto") -> None:
        from sentence_transformers import SentenceTransformer

        self.device = "cuda" if (device == "auto" and torch.cuda.is_available()) else device
        model_name  = model_name or self.DEFAULT_MODEL

        log.info("Loading text embedder: %s on %s", model_name, self.device)
        self.model = SentenceTransformer(model_name, device=self.device)

    def embed(self, text: str, prefix: str = "query: ") -> np.ndarray:
        """Embed a single text string. Use 'passage: ' prefix for documents."""
        # e5 models require a prefix
        embedding = self.model.encode(
            prefix + text,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return embedding.astype(np.float32)

    def embed_batch(
        self,
        texts: list[str],
        ids: list[str],
        metadata: list[dict],
        prefix: str = "passage: ",
        batch_size: int = 64,
    ) -> list[dict]:
        """Embed a batch of texts."""
        prefixed = [prefix + t for t in texts]

        embeddings = self.model.encode(
            prefixed,
            batch_size=batch_size,
            normalize_embeddings=True,
            show_progress_bar=True,
        )

        return [
            {
                "id":        ids[i],
                "embedding": embeddings[i].tolist(),
                "metadata":  metadata[i],
            }
            for i in range(len(texts))
        ]


# =============================================================================
# Vector Store Upsert
# =============================================================================

def upsert_to_pinecone(vectors: list[dict], index_name: str = PINECONE_INDEX) -> None:
    """Upsert embedding vectors to Pinecone."""
    from pinecone import Pinecone

    pc    = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
    index = pc.Index(index_name)

    batch_size = 100
    for i in tqdm(range(0, len(vectors), batch_size), desc="Upserting to Pinecone"):
        batch = vectors[i : i + batch_size]
        index.upsert(
            vectors=[(v["id"], v["embedding"], v["metadata"]) for v in batch]
        )
    log.info("Upserted %d vectors to Pinecone index '%s'", len(vectors), index_name)


def upsert_to_weaviate(vectors: list[dict], class_name: str = WEAVIATE_CLASS) -> None:
    """Upsert embedding vectors to Weaviate."""
    import weaviate

    client = weaviate.connect_to_local(
        host=os.getenv("WEAVIATE_URL", "http://localhost:8085")
            .replace("http://", "").split(":")[0],
        port=int(os.getenv("WEAVIATE_URL", "http://localhost:8085")
            .split(":")[-1]) if ":" in os.getenv("WEAVIATE_URL", "") else 8080,
        auth_credentials=weaviate.auth.AuthApiKey(
            api_key=os.getenv("WEAVIATE_API_KEY", "")
        ),
    )

    collection = client.collections.get(class_name)
    with collection.batch.dynamic() as batch:
        for v in tqdm(vectors, desc="Upserting to Weaviate"):
            batch.add_object(
                properties={**v["metadata"], "audioId": v["id"]},
                vector=v["embedding"],
                uuid=v["id"],
            )

    client.close()
    log.info("Upserted %d vectors to Weaviate class '%s'", len(vectors), class_name)


def save_embeddings_local(vectors: list[dict], output_path: Path) -> None:
    """Save embeddings to a numpy npz file for local use / DVC versioning."""
    ids        = [v["id"] for v in vectors]
    embeddings = np.array([v["embedding"] for v in vectors], dtype=np.float32)
    metadata   = [v["metadata"] for v in vectors]

    np.savez_compressed(
        output_path,
        ids=np.array(ids),
        embeddings=embeddings,
        metadata=np.array([json.dumps(m) for m in metadata]),
    )
    log.info("Saved %d embeddings to %s", len(vectors), output_path)


# =============================================================================
# Main
# =============================================================================

def main() -> None:
    parser = argparse.ArgumentParser(description="Compute and store Darija embeddings")
    parser.add_argument("--mode",            choices=["audio", "text", "both"], default="both")
    parser.add_argument("--input-manifest",  required=True)
    parser.add_argument("--audio-root",      default=".")
    parser.add_argument("--store",           choices=["pinecone", "weaviate", "local"],
                        default="local")
    parser.add_argument("--output-dir",      default="data/samples/embeddings")
    parser.add_argument("--whisper-model",   default="openai/whisper-small")
    parser.add_argument("--text-model",      default="intfloat/multilingual-e5-large")
    parser.add_argument("--batch-size",      type=int, default=16)
    parser.add_argument("--device",          default="auto")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    audio_root = Path(args.audio_root)

    # Load manifest
    samples: list[dict] = []
    with open(args.input_manifest, encoding="utf-8") as f:
        for line in f:
            samples.append(json.loads(line.strip()))
    log.info("Loaded %d samples", len(samples))

    # Audio embeddings
    if args.mode in ("audio", "both"):
        embedder = WhisperAudioEmbedder(
            model_name=args.whisper_model, device=args.device
        )
        audio_vectors = embedder.embed_batch(samples, audio_root, args.batch_size)

        if args.store == "pinecone":
            upsert_to_pinecone(audio_vectors)
        elif args.store == "weaviate":
            upsert_to_weaviate(audio_vectors, class_name="DarijaAudioEmbedding")
        else:
            save_embeddings_local(audio_vectors, output_dir / "audio_embeddings.npz")

    # Text embeddings
    if args.mode in ("text", "both"):
        texts    = [s.get("transcript", s.get("reference", "")) for s in samples]
        ids      = [s["audio_id"] for s in samples]
        metadata = [{"type": "text", "dialect": s.get("dialect", "unknown"),
                     "domain": s.get("domain", "unknown")} for s in samples]

        text_embedder = DarijaTextEmbedder(model_name=args.text_model, device=args.device)
        text_vectors  = text_embedder.embed_batch(
            texts, ids, metadata, batch_size=args.batch_size
        )

        if args.store == "pinecone":
            upsert_to_pinecone(text_vectors, index_name=PINECONE_INDEX + "-text")
        elif args.store == "weaviate":
            upsert_to_weaviate(text_vectors, class_name="DarijaTextEmbedding")
        else:
            save_embeddings_local(text_vectors, output_dir / "text_embeddings.npz")

    log.info("Done.")


if __name__ == "__main__":
    main()