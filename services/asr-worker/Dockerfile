# ================================================
# Stage 1: Builder (CPU-only for faster builds)
# ================================================
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY services/asr-worker/package*.json ./services/asr-worker/

RUN npm ci --workspace=services/asr-worker

COPY . .

RUN npm run build --workspace=services/asr-worker

# ================================================
# Stage 2: Production with CUDA
# ================================================
FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04 AS production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1001 asrworker

# Copy Node.js wrapper
COPY --from=builder /app/services/asr-worker/dist ./dist
COPY --from=builder /app/services/asr-worker/package*.json ./

# Install Python dependencies for Whisper
COPY services/asr-worker/models/whisper/requirements.txt ./models/whisper/
RUN pip3 install --no-cache-dir -r models/whisper/requirements.txt

# Install production Node dependencies
RUN npm ci --only=production --workspace=services/asr-worker

# Copy Whisper model loader
COPY services/asr-worker/models/whisper/loader.py ./models/whisper/

USER asrworker

EXPOSE 3000

CMD ["node", "dist/index.js"]