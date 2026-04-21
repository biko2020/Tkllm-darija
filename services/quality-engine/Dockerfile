# ================================================
# Stage 1: Builder
# ================================================
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY services/quality-engine/package*.json ./services/quality-engine/

RUN npm ci --workspace=services/quality-engine

COPY . .

RUN npm run build --workspace=services/quality-engine

# ================================================
# Stage 2: Production
# ================================================
FROM node:20-slim AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S qualityengine -u 1001 -G nodejs

COPY --from=builder /app/services/quality-engine/dist ./dist
COPY --from=builder /app/services/quality-engine/package*.json ./

RUN npm ci --only=production --workspace=services/quality-engine

USER qualityengine

EXPOSE 3000

CMD ["node", "dist/index.js"]