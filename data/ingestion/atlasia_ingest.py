"""
AtlasIA Dataset Ingestion Script
- Downloads and processes the AtlasIA Moroccan Arabic speech dataset.
- Outputs a normalized manifest in JSONL format for downstream ML tasks.
"""
import argparse
from common import download_file, load_jsonl, save_jsonl, clean_text
import os

ATLASIA_URL = "https://example.com/atlasia/atlasia_dataset.jsonl"  # Replace with real URL


def main():
    parser = argparse.ArgumentParser(description="Ingest AtlasIA dataset.")
    parser.add_argument('--output', type=str, default="../samples/atlasia_manifest.jsonl", help="Output manifest path")
    args = parser.parse_args()

    raw_path = "atlasia_raw.jsonl"
    print(f"Downloading AtlasIA dataset from {ATLASIA_URL} ...")
    download_file(ATLASIA_URL, raw_path)

    print("Processing and cleaning data ...")
    data = load_jsonl(raw_path)
    for item in data:
        item['transcript'] = clean_text(item.get('transcript', ''))
    save_jsonl(data, args.output)
    print(f"Saved cleaned manifest to {args.output}")

if __name__ == "__main__":
    main()
