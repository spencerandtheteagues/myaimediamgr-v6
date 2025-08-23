# --- Stage 1: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all source code
COPY . .

# Build the client
WORKDIR /app/client
RUN npm install
RUN npm run build

# Build the server
WORKDIR /app
RUN npm run build:server


# --- Stage 2: Production ---
FROM node:20-alpine
WORKDIR /app

# Install ffmpeg for video processing
RUN apk add --no-cache ffmpeg

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from the builder stage
COPY --from=builder /app/client/dist/public ./dist/public
COPY --from=builder /app/dist ./dist

# Copy server and shared code
COPY server ./server
COPY shared ./shared

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.cjs"]
