FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
WORKDIR /app/backend
RUN npm ci

COPY backend/ ./
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production

COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
