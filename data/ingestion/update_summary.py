import json
import os
from datetime import datetime

# Paths
SAMPLES_METADATA_DIR = "data/samples/metadata/"
SUMMARY_FILE = "data/samples/dataset_summary.json"

def generate_summary():
    summary = {
        "dataset_name": "Tkllm-darija-samples",
        "total_samples": 0,
        "total_duration_seconds": 0.0,
        "language_breakdown": {"darija": 0, "msa": 0},
        "accent_distribution": {
            "Casablanca": 0, "Marrakchi": 0, "Chamali": 0, "Fassi": 0, "Souss": 0
        },
        "domains": {
            "casual_conversation": 0, "market_negotiation": 0, "educational": 0,
            "news_media": 0, "customer_support": 0, "medical": 0, "code_switching": 0
        },
        "quality_scores": [],
        "last_generated": datetime.utcnow().isoformat() + "Z"
    }

    # Iterate through all JSON files in the metadata directory
    for filename in os.listdir(SAMPLES_METADATA_DIR):
        if filename.endswith(".json"):
            with open(os.path.join(SAMPLES_METADATA_DIR, filename), 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                # Update counts
                summary["total_samples"] += 1
                summary["total_duration_seconds"] += data.get("metadata", {}).get("duration_seconds", 0)
                
                # Update language
                lang = data.get("language")
                if lang in summary["language_breakdown"]:
                    summary["language_breakdown"][lang] += 1
                
                # Update Accents
                accent = data.get("metadata", {}).get("accent")
                if accent in summary["accent_distribution"]:
                    summary["accent_distribution"][accent] += 1
                
                # Update Domains (assuming you add 'domain' to your individual metadata files)
                domain = data.get("metadata", {}).get("domain")
                if domain in summary["domains"]:
                    summary["domains"][domain] += 1
                
                # Collect quality scores for averaging
                summary["quality_scores"].append(data.get("confidence", 0))

    # Calculate final average quality
    if summary["quality_scores"]:
        summary["quality_average_score"] = sum(summary["quality_scores"]) / len(summary["quality_scores"])
    else:
        summary["quality_average_score"] = 0.0
    
    # Clean up temporary scores list before saving
    del summary["quality_scores"]

    # Write the summary file
    with open(SUMMARY_FILE, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Summary updated with {summary['total_samples']} samples.")

if __name__ == "__main__":
    generate_summary()