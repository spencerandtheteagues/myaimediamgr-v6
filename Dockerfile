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

# Sanity Checks before build
# 0) Make sure the client actually has index.html at the configured root
RUN test -f client/index.html || (echo "Missing client/index.html at Vite root" && exit 1)

# 1) React present for react/jsx-runtime
RUN node -e "require.resolve('react/jsx-runtime'); console.log('OK: react/jsx-runtime')"

# 2) Vite React plugin present
RUN node -e "require.resolve('@vitejs/plugin-react'); console.log('OK: @vitejs/plugin-react')"

# 3) Tailwind/PostCSS (only if you’re using Tailwind)
RUN node -e "require.resolve('postcss'); require.resolve('tailwindcss'); console.log('OK: postcss + tailwindcss')"

# 4) Show which config Vite sees (helps if it still can’t find index.html)
RUN node -e "console.log('vite root=', require('path').resolve('client'))"

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