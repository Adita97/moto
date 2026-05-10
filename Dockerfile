# ─── Stage 1: Build React client ────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Install client dependencies first (layer-cache friendly)
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci

# Copy full client source (including public/hero.mp4 and locales)
COPY client/ ./client/

# Build React app — outputs to client/dist/
RUN cd client && npm run build


# ─── Stage 2: Production server ──────────────────────────────────────────────
FROM node:22-slim

WORKDIR /app

# Install server production dependencies only
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source (node_modules excluded via .dockerignore)
COPY server/ ./server/

# Copy React build output from Stage 1
COPY --from=builder /app/client/dist ./client/dist

# Create persistent data & upload directories
# Docker will populate an empty named volume from these on first start
RUN mkdir -p server/data \
             server/uploads/thumbnails \
             server/uploads/bike-photos

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "server/index.js"]
