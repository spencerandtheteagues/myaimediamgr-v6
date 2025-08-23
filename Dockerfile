# --- Stage 1: Frontend Builder ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine
WORKDIR /app

# Install ffmpeg for video processing
RUN apk add --no-cache ffmpeg

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from the builder stage
COPY --from=frontend-builder /app/dist ./dist

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
CMD ["npm", "start"]
