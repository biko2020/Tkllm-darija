import json, os
from datetime import datetime, UTC
import argparse

def generate_summary(metadata_dir="data/samples/metadata", summary_file="data/samples/dataset_summary.json"):
    summary = {
        "dataset_name": "Tkllm-darija-samples",
        "total_samples": 0,
        "total_duration_seconds": 0.0,
        "language_breakdown": {"darija": 0, "msa": 0},
        "accent_distribution": {"Casablanca": 0, "Marrakchi": 0, "Chamali": 0, "Fassi": 0, "Souss": 0},
        "domains": {
            "casual_conversation": 0, "market_negotiation": 0, "educational": 0,
            "news_media": 0, "customer_support": 0, "medical": 0, "code_switching": 0
        },
        "last_generated": datetime.now(UTC).isoformat()
    }

    # iterate through metadata files...
    for filename in os.listdir(metadata_dir):
        if filename.endswith(".json"):
            path = os.path.join(metadata_dir, filename)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except json.JSONDecodeError:
                print(f"⚠️ Skipping invalid JSON file: {filename}")
                continue

            summary["total_samples"] += 1
            summary["total_duration_seconds"] += data.get("duration_seconds", 0)
            lang = data.get("language")
            if lang in summary["language_breakdown"]:
                summary["language_breakdown"][lang] += 1
            accent = data.get("accent")
            if accent in summary["accent_distribution"]:
                summary["accent_distribution"][accent] += 1
            domain = data.get("domain")
            if domain in summary["domains"]:
                summary["domains"][domain] += 1

    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"✅ Summary updated with {summary['total_samples']} samples.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update dataset summary from sample metadata")
    parser.add_argument("--metadata-dir", default="data/samples/metadata", help="Path to metadata directory")
    parser.add_argument("--summary-file", default="data/samples/dataset_summary.json", help="Path to summary file")
    args = parser.parse_args()

    generate_summary(metadata_dir=args.metadata_dir, summary_file=args.summary_file)
