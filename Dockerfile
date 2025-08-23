# -------- Builder --------
FROM node:20-alpine AS builder
WORKDIR /app

# Manifests first
COPY package.json package-lock.json ./

# Copy everything once (no optional COPY tricks)
COPY . .

# Find the client manifest dynamically (supports multiple layouts)
# and merge its deps into root package.json so Vite can resolve them.
RUN node -e "const fs=require('fs'), p=require('path');   const candidates=['client/package.json',     'myaimediamgr_project/myaimediamgr-frontend/package.json',     'frontend/package.json', 'apps/web/package.json'];   const found=candidates.find(f=>fs.existsSync(f));   if(!found){console.log('No client/package.json found; skipping merge'); process.exit(0);}   const root=JSON.parse(fs.readFileSync('package.json','utf8'));   const client=JSON.parse(fs.readFileSync(found,'utf8'));   const put=(src,key)=>{ if(!src) return; root[key] ||= {};     for(const [k,v] of Object.entries(src)) if(!root[key][k]) root[key][k]=v; };   put(client.dependencies,'dependencies');   put(client.devDependencies,'devDependencies');   fs.writeFileSync('package.json', JSON.stringify(root,null,2));   console.log('Merged client deps from',found);"

# Sync lockfile to the (possibly updated) package.json, then clean install
RUN npm install --package-lock-only --ignore-scripts --no-audit --no-fund  && npm ci

# (Optional) Sanity checks to fail fast if key deps are missing
RUN node -e "require.resolve('react/jsx-runtime');              require.resolve('@vitejs/plugin-react');              require.resolve('@tanstack/react-query');              console.log('Sanity: react + plugin-react + react-query present')"

# Build: emits dist/public (client) + dist/index.cjs (server)
# Tell Tailwind exactly which config to use
ENV TAILWIND_CONFIG=/app/client/tailwind.config.cjs
RUN npm run build

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