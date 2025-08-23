# -------- Builder --------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir -p /app/shared   # safe even if not used

RUN npm run build          # -> dist/public + dist/index.cjs

# -------- Runtime --------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev

EXPOSE 8080
CMD ["node", "dist/index.cjs"]
