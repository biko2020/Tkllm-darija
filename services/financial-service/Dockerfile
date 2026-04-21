FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Note: You might need to copy your shared workspace folders if using monorepo
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# Add non-root user for security
USER node
CMD ["node", "dist/index.js"]