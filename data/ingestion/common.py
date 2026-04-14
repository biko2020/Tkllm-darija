"""
Common utilities for data ingestion scripts (downloading, cleaning, parsing, etc.)
"""
import os
import json
import requests
from typing import Any, Dict, Optional

def download_file(url: str, dest_path: str, chunk_size: int = 8192) -> None:
    """Download a file from a URL to a local destination."""
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(dest_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)

def load_jsonl(path: str) -> list[Dict[str, Any]]:
    """Load a JSONL file into a list of dicts."""
    with open(path, 'r', encoding='utf-8') as f:
        return [json.loads(line) for line in f if line.strip()]

def save_jsonl(data: list[Dict[str, Any]], path: str) -> None:
    """Save a list of dicts to a JSONL file."""
    with open(path, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

def clean_text(text: str) -> str:
    """Basic text normalization (strip, collapse whitespace)."""
    return ' '.join(text.strip().split())
