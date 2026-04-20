# ── Build stage ───────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Copiar dependencias primero (cache layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código fuente
COPY src/ ./src/

# ── Runtime ───────────────────────────────────────────────
EXPOSE 3000

# El volumen de Fly.io se monta en /data
# La variable DATA_DIR apunta ahí para persistir la BD
ENV DATA_DIR=/data
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "src/app.js"]
