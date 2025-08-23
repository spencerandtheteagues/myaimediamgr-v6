# -------- Builder --------
FROM node:20-alpine AS builder
WORKDIR /app

# Install root deps (vite/esbuild live here)
COPY package*.json ./
RUN npm ci

# Copy source (no optional COPY tricks)
COPY . .

# If you sometimes don't have a shared/ folder, just ensure the path exists
# (this is safe even if the folder DID come from the build context)
RUN mkdir -p /app/shared

# Build client (uses vite.config.mts for root) + bundle server to dist/index.cjs
RUN npm run build

# -------- Runtime --------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Only what we need to run
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev

EXPOSE 8080
CMD ["node", "dist/index.cjs"]