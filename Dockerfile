# -------- Builder --------
FROM node:20-alpine AS builder
WORKDIR /app

# Install root deps (vite/esbuild live here)
COPY package*.json ./
RUN npm ci

# Copy sources
COPY client ./client
COPY server ./server
COPY shared ./shared 2>/dev/null || true
COPY vite.config.mts ./vite.config.mts

# Build client (uses vite.config.mts) + bundle server to dist/index.cjs
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
