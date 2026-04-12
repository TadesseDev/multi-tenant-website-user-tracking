# Builder stage
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and migrations (needed for prisma migrate deploy)
COPY prisma ./prisma

# Copy built application
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main"]
