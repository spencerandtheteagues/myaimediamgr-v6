# -------- Builder --------
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Bring in root manifests
COPY package.json package-lock.json ./

# 2) Bring in client manifest early so we can read it
COPY client/package.json ./client/package.json

# 3) Merge client deps → root package.json (no versions guessed; uses client's)
RUN node -e "const fs=require('fs');   const root=JSON.parse(fs.readFileSync('package.json','utf8'));   const client=JSON.parse(fs.readFileSync('client/package.json','utf8'));   const add=(from, field)=>{ if(!from) return; root[field] ||= {};     for(const [k,v] of Object.entries(from)) if(!root[field][k]) root[field][k]=v; };   add(client.dependencies,'dependencies');   add(client.devDependencies,'devDependencies');   fs.writeFileSync('package.json', JSON.stringify(root,null,2));   console.log('Merged client deps into root');"

# 4) Sync lockfile to the (now-updated) package.json, then clean install
RUN npm install --package-lock-only --ignore-scripts --no-audit --no-fund  && npm ci

# 5) Copy the rest of the source
COPY . .

# (optional) sanity checks — keep these!
RUN node -e "require.resolve('react/jsx-runtime');              require.resolve('@vitejs/plugin-react');              require.resolve('postcss');              require.resolve('tailwindcss');              require.resolve('wouter');              require.resolve('@tanstack/react-query');              console.log('Sanity: all critical deps resolved')"

# 6) Build client + server
RUN npm run build

# -------- Runtime --------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node","dist/index.cjs"]
