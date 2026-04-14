# Builder stage
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
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

# Create entrypoint script to run migrations and seed before starting app
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "Generating Prisma client..."' >> /app/entrypoint.sh && \
    echo 'npx prisma generate' >> /app/entrypoint.sh && \
    echo 'echo "Running database migrations..."' >> /app/entrypoint.sh && \
    echo 'npx prisma migrate deploy' >> /app/entrypoint.sh && \
    echo 'echo "Starting application..."' >> /app/entrypoint.sh && \
    echo 'exec node dist/src/main' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
