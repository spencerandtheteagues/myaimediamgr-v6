# -------- Builder --------
FROM node:20-alpine AS builder
WORKDIR /app

# Manifests first
COPY package.json package-lock.json ./

# Copy everything once (no optional COPY tricks)
COPY . .

# Sync lockfile to the (possibly updated) package.json, then clean install
RUN npm install --package-lock-only --ignore-scripts --no-audit --no-fund  && npm ci

# Build: emits dist/public (client) + dist/index.cjs (server)
# Ensure Tailwind uses the client config even if a root config exists
ENV TAILW-IND_CONFIG=/app/client/tailwind.config.cjs
# Use a build argument to pass the Stripe key securely
ARG VITE_STRIPE_PUBLIC_KEY
RUN echo "VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}" > /app/client/.env
RUN npm run build
RUN ls -l /app/client/public

# -------- Runtime --------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Use the SAME manifest/lock that produced the build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.cjs"]
