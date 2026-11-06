FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production \
    DATA_DIR=/data \
    PORT=3000

# Install production dependencies (sqlite3 / sharp ship prebuilt linux binaries)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# App source
COPY . .

# Persistent data (SQLite DB, uploads, QR codes) lives in a volume
RUN mkdir -p /data && chown -R node:node /data
VOLUME ["/data"]
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/healthz', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
