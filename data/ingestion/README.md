# 📥 Data Ingestion Pipeline

This directory contains all scripts and utilities responsible for ingesting, cleaning, and preparing **Darija speech and text datasets** for training and evaluation.

---

## 🔎 Overview

The ingestion pipeline supports multiple public and internal Darija datasets, including:

- **DODa** — Large-scale Darija speech corpus  
- **DVoice** — High-quality spoken Darija dataset  
- **AtlasIA** — Various Moroccan Arabic resources  
- Future internal collections (crowdsourced via the mobile app)

---

## 📂 Directory Structure

```bash
ingestion/
├── doda_ingest.py              # Ingestor for the DODa dataset
├── dvoice_ingest.py            # Ingestor for the DVoice corpus
├── atlasia_ingest.py           # Ingestor for AtlasIA resources
├── common.py                   # Shared utilities (download, validation, normalization)
├── config.yaml                 # Configuration for sources, paths, and processing options
└── README.md                   # This file

```

## Main Scripts
1. doda_ingest.py

Downloads DODa dataset from official sources
Extracts audio and transcription pairs
Applies basic cleaning and standardization
Generates metadata and quality scores

2. dvoice_ingest.py

Handles the DVoice corpus
Supports multiple audio formats
Performs speaker metadata extraction
Aligns transcriptions with audio segments

3. atlasia_ingest.py

Ingests various AtlasIA Moroccan Arabic resources
Converts different annotation formats to unified schema
Merges with existing datasets when appropriate

4. common.py
Contains reusable functions for:

Secure downloading with progress bars
Audio validation and format conversion
Text normalization for Darija (Arabizi ↔ Arabic script)
Metadata generation and validation
Dataset splitting (train/dev/test)

## Usage
Run a specific ingestor
Bash# Ingest DODa dataset
python -m ingestion.doda_ingest --output-dir ../versions/v1/raw

# Ingest DVoice with custom config
python -m ingestion.dvoice_ingest --config config.yaml
Run full ingestion pipeline
Bashpython -m ingestion.run_all --version v2

## Configuration
See config.yaml for:

Source URLs and authentication (if needed)
Processing parameters (sample rate, max duration, etc.)
Output directory structure
Quality filtering thresholds

## Output Structure
All ingested data follows this standardized layout:
textversions/

versions/
└── v1/
    ├── raw/           # Original downloaded files
    ├── processed/     # Cleaned and standardized data
    ├── audio/         # Final audio files (standardized format)
    ├── transcripts/   # Normalized transcriptions
    └── metadata/      # JSON metadata files

