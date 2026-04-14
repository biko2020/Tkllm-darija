"""
DVoice Dataset Ingestion Script
- Downloads and processes the DVoice Moroccan Arabic speech dataset.
- Outputs a normalized manifest in JSONL format for downstream ML tasks.
"""
import argparse
from common import download_file, load_jsonl, save_jsonl, clean_text
import os

DVOICE_URL = "https://example.com/dvoice/dvoice_dataset.jsonl"  # Replace with real URL


def main():
    parser = argparse.ArgumentParser(description="Ingest DVoice dataset.")
    parser.add_argument('--output', type=str, default="../samples/dvoice_manifest.jsonl", help="Output manifest path")
    args = parser.parse_args()

    raw_path = "dvoice_raw.jsonl"
    print(f"Downloading DVoice dataset from {DVOICE_URL} ...")
    download_file(DVOICE_URL, raw_path)

    print("Processing and cleaning data ...")
    data = load_jsonl(raw_path)
    for item in data:
        item['transcript'] = clean_text(item.get('transcript', ''))
    save_jsonl(data, args.output)
    print(f"Saved cleaned manifest to {args.output}")

if __name__ == "__main__":
    main()
