# ASR Worker Service

**Status:** Phase 00 Scaffolded
**Runtime:** Python 3.12 + FastAPI

## Description
This service handles asynchronous Automatic Speech Recognition (ASR) for Moroccan Darija audio files.

## Expected Interface
- **Trigger:** Consumes events from Kafka topic `audio.uploaded`.
- **Input:** S3 Object Key for `.wav` or `.mp3` files.
- **Output:** Publishes transcription result and confidence scores to `task.transcribed`.
- **Model:** OpenAI Whisper large-v3 fine-tuned for Darija.