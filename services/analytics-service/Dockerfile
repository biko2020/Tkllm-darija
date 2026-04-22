# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY .env.example ./

# Install only production dependencies
RUN npm install --omit=dev

# Expose service port
EXPOSE 3000

# Start the service
CMD ["node", "dist/index.js"]
