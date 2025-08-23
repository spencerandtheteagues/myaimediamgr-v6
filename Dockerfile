# -------- Builder --------
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Copy manifests first
COPY package.json package-lock.json ./

# 2) Ensure the lockfile matches package.json, then do a clean install
#    (this updates *the in-container* lockfile if needed)
RUN npm install --package-lock-only --ignore-scripts --no-audit --no-fund  && npm ci

# 3) Copy the rest of the source
COPY . .

# 4) Build client + server (assumes your scripts produce dist/public + dist/index.cjs)
RUN npm run build

# -------- Runtime --------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# 5) Use the SAME manifest + lockfile that produced the build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# 6) Install exactly what's in that lock, prod-only
RUN npm ci --omit=dev

# 7) Copy the built artifacts
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.cjs"]