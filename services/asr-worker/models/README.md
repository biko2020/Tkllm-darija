# ASR Worker Models

This directory manages all machine learning models used by the ASR transcription worker.

## Structure

- **whisper/** — Primary speech-to-text engine (OpenAI Whisper via faster-whisper)
- **cache/** — Local disk cache for loaded models (prevents reloading on every job)

## Supported Models

- `whisper-small` — Fast, good for development and low-resource environments
- `whisper-large-v3` — Highest accuracy (recommended for production)

## Key Files

### `whisper/loader.py`

Handles:
- Lazy loading of Whisper models
- GPU detection and acceleration (CUDA 12.1)
- Transcription with language detection (`ar` for Darija)
- Confidence scoring and timestamp generation
- Output in standardized JSON format

### Usage Example

```bash
python models/whisper/loader.py \
  --model small \
  --audio /tmp/job_12345.wav \
  --language ar

### Environment Variables (used by loader)

WHISPER_MODEL → small | large-v3 (default: small)
WHISPER_DEVICE → cuda | cpu
WHISPER_COMPUTE_TYPE → float16 | int8 | int8_float16

### Notes
Models are automatically downloaded on first use and cached locally.
GPU acceleration is preferred when available.
All output follows the internal TranscriptionResult interface defined in src/types.ts.

### 2. `services/asr-worker/models/whisper/loader.py`

```python
#!/usr/bin/env python3
"""
Whisper Model Loader for Tkllm ASR Worker
Supports faster-whisper with CUDA acceleration.
"""
