"""
DODa Dataset Ingestion Script
- Downloads and processes the DODa Moroccan Arabic speech dataset.
- Outputs a normalized manifest in JSONL format for downstream ML tasks.
"""
import argparse
from common import download_file, load_jsonl, save_jsonl, clean_text
import os

DODA_URL = "https://example.com/doda/doda_dataset.jsonl"  # Replace with real URL


def main():
    parser = argparse.ArgumentParser(description="Ingest DODa dataset.")
    parser.add_argument('--output', type=str, default="../samples/doda_manifest.jsonl", help="Output manifest path")
    args = parser.parse_args()

    raw_path = "doda_raw.jsonl"
    print(f"Downloading DODa dataset from {DODA_URL} ...")
    download_file(DODA_URL, raw_path)

    print("Processing and cleaning data ...")
    data = load_jsonl(raw_path)
    for item in data:
        item['transcript'] = clean_text(item.get('transcript', ''))
    save_jsonl(data, args.output)
    print(f"Saved cleaned manifest to {args.output}")

if __name__ == "__main__":
    main()
