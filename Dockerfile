# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package manifests and install all dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the client and server
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application artifacts
COPY --from=builder /app/dist ./dist

# Expose the port and define the start command
EXPOSE 8080
CMD [ "node", "dist/index.cjs" ]