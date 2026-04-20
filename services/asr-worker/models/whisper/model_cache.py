"""
Model Cache Manager for Whisper ASR Worker

Handles lazy loading and caching of Whisper models to avoid reloading
the same model for every transcription job.
"""

import threading
from pathlib import Path
from typing import Optional, Dict
from faster_whisper import WhisperModel

class ModelCache:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._models: Dict[str, WhisperModel] = {}
        return cls._instance

    def get_model(self, model_name: str = "small", device: str = "auto", compute_type: str = "auto") -> WhisperModel:
        """
        Get or load a Whisper model from cache.
        """
        cache_key = f"{model_name}_{device}_{compute_type}"

        if cache_key not in self._models:
            print(f"Loading Whisper model '{model_name}' on {device} for the first time...")
            self._models[cache_key] = WhisperModel(
                model_size_or_path=model_name,
                device=device,
                compute_type=compute_type,
                download_root=str(Path.home() / ".cache" / "whisper")
            )
            print(f"Model '{model_name}' loaded successfully.")

        return self._models[cache_key]

    def clear_cache(self):
        """Clear all loaded models from memory."""
        self._models.clear()
        print("Whisper model cache cleared.")

    def get_cache_info(self) -> dict:
        """Return information about currently cached models."""
        return {
            "cached_models": list(self._models.keys()),
            "model_count": len(self._models)
        }


# Singleton instance
model_cache = ModelCache()