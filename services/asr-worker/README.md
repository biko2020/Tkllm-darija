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


## Testing Strategy
The ASR Worker has a layered test suite under services/asr-worker/test/:

│   │   └── test/                                     # ASR test suite
│   │       ├── unit/                                 # Pure function & logic tests
│   │       │   ├── processor.unit-spec.ts            # Tests for transcription logic
│   │       │   ├── storage.unit-spec.ts              # Tests for S3 utilities
│   │       │   └── types.unit-spec.ts                # Validation of internal types
│   │       │
│   │       ├── integration/                          # Service + broker/storage mocks
│   │       │   ├── kafka.integration-spec.ts         # Kafka consumer/producer mocked tests
│   │       │   ├── s3.integration-spec.ts            # Mocked S3/MinIO integration
│   │       │   └── whisper.integration-spec.ts       # Whisper model loading (mocked GPU)
│   │       │
│   │       ├── e2e/                                  # End-to-End flows for the worker
│   │       │   └── transcription.e2e-spec.ts         # Full flow: consume → process → upload
│   │       │
│   │       ├── utils/                                # Helper functions for tests
│   │       │   ├── kafka.mock.ts                     # Mock Kafka producer/consumer
│   │       │   ├── s3.mock.ts                        # Mock S3 client
│   │       │   ├── whisper.stub.ts 
│   │       │   └── sample-audio.ts                   # Fixture audio file for tests
│   │       └── setup.ts                              # Service-specific test config (dotenv, DI overrides)


## Running Tests

**Unit tests:**
```bash
npm run test:unit
```
**Integration tests:**
```bash
npm run test:integration
```
**E2E tests:**
```bash
npm run test:e2e
```
- Unit tests run fast and isolated. Integration/E2E tests may require Docker (Kafka, S3/MinIO) or mocks depending on configuration.

## Development Notes
- Language: TypeScript (Node.js wrapper) + Python bridge for Whisper.

- Dependencies: KafkaJS, MinIO SDK, FastAPI (Python side).

### Environment:

. KAFKA_BROKERS

. S3_BUCKET

. WHISPER_MODEL_PATH

