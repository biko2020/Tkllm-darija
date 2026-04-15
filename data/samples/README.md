# Sample Data Directory

This folder contains **anonymized, real-world Darija samples** used for development, testing, debugging, and demo purposes.

## Purpose

- Allow developers to test ingestion, preprocessing, and evaluation pipelines locally
- Provide realistic examples for frontend/mobile app development
- Enable quick testing of ASR models and quality scoring
- Serve as seed data for unit and integration tests

## Directory Structure
samples/
├── audio_samples/          # Short WAV audio files (6–15 seconds)
├── transcripts/            # Gold-standard transcriptions (UTF-8)
├── metadata/               # JSON metadata per sample
└── dataset_summary.json    # Overall statistics


## Sample Characteristics

- **Accents**: Casablanca, Marrakech, Rabat, Fez, and rural variants
- **Domains**: Daily conversation, souk negotiation, medical, customer service, code-switching (Darija + French)
- **Duration**: 6–15 seconds per clip (ideal for fast testing)
- **Quality**: Mix of clean and noisy recordings (to test robustness)
- **Anonymization**: All personal information removed or replaced

## Usage Examples

```bash
# Play a sample
vlc audio_samples/sample_001.wav

# View transcription
cat transcripts/sample_001.txt

# View rich metadata
cat metadata/sample_001.json