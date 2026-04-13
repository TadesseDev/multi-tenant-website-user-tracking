#!/bin/bash
set -e

echo "🚀 Multi-Tenant Tracking API - Setup Script"
echo "==========================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env created"
fi

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install it and try again."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🐳 Starting Docker services..."
docker compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec tadesse-mag-takehome-postgres-1 pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start"
        exit 1
    fi
    sleep 1
done

echo ""
echo "⏳  Running database migrations..."
npx prisma migrate deploy

echo ""
echo "🌱 Seeding database with test data..."
npm run seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 Your API is now running!"
echo ""
echo "📝 Access Points:"
echo "   - API: http://localhost:3000"
echo "   - Swagger Docs: http://localhost:3000/api"
echo ""
echo "🔐 Test Credentials:"
echo "   ACME Admin:   admin@acme-corp.com / admin123"
echo "   ACME User:    user@acme-corp.com  / user123"
echo "   Beta Admin:   admin@beta-inc.com  / admin123"
echo "   Beta User:    user@beta-inc.com   / user123"
echo ""
echo "📚 View database with: npx prisma studio"
echo "🛑 Stop services: docker compose down"
echo "📖 More info: Check README.md"
