# Multi-Tenant Website Tracking API

A production-ready NestJS backend for ingesting, processing, and analyzing website events in a multi-tenant environment.

**Author:** Tadesse D
**Status:** ✅ Production Ready | 15/15 Tests Passing

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Requirements Mapping](#requirements-mapping)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🚀 Quick Start

### Option 1: Docker (Recommended - 1 Command)

```bash
docker compose up --build
```

That’s it! The API will:

- ✅ Start PostgreSQL and Redis
- ✅ Build the NestJS container
- ✅ Automatically run migrations
- ✅ Automatically seed test data
- ✅ Listen on <http://localhost:3000>

**Access Points:**

- 🔌 **API**: <http://localhost:3000>
- 📚 **Swagger Docs**: <http://localhost:3000/api>
- 🗄️ **Database Visual**: `npx prisma studio`

### Option 2: Local Development (Without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (.env)
cp .env.example .env

# 3. Start PostgreSQL and Redis (see Installation section)

# 4. Run migrations and seed
npx prisma migrate deploy
npm run seed

# 5. Start development server
npm run start:dev
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Multi-Tenant Isolation** | Strict tenant-scoped data access with no cross-contamination |
| 🔑 **JWT Authentication** | Stateless auth with access tokens + single-use refresh token rotation |
| 👥 **Role-Based Access Control** | TENANT_ADMIN and TENANT_USER roles with permission guards |
| 📊 **Event Ingestion** | Public async endpoint (no auth required), returns 202 Accepted |
| 🔄 **Idempotent Processing** | BullMQ worker with unique DB constraint prevents duplicates |
| 📈 **On-Demand Analytics** | SQL-based aggregation with flexible date ranges |
| 📋 **Campaign Management** | Full CRUD operations with tenant isolation |
| ✅ **Full Test Coverage** | 15+ unit tests, all passing |
| 📖 **Swagger Documentation** | Interactive API reference at `/api` |
| 🐳 **Docker Ready** | Complete containerization with auto-setup |

---

## 📦 Prerequisites

### Docker Setup (Simplest)

- Docker 20.10+
- Docker Compose 2.0+

### Local Setup

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 16+ ([Download](https://www.postgresql.org/download/))
- **Redis** 7+ ([Download](https://redis.io/download))

---

## 📥 Installation

### Using Docker (Recommended)

```bash
# Clone or navigate to project
cd Tadesse-MAG-takehome

# Start everything
docker compose up --build
```

**First time only:** ~2-3 minutes for initial build and seed.

### Local Development Setup

#### Step 1: Install Node Dependencies

```bash
npm install
```

#### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Update with your local credentials (see Configuration section)
```

#### Step 3: Start Database Services

**PostgreSQL:**

```bash
# Option A: Docker
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tracking_db \
  -p 5432:5432 \
  postgres:16

# Option B: Homebrew (macOS)
brew services start postgresql

# Option C: System package (Linux)
sudo systemctl start postgresql
```

**Redis:**

```bash
# Option A: Docker
docker run -d --name redis -p 6379:6379 redis:7

# Option B: Homebrew (macOS)
brew services start redis

# Option C: System package (Linux)
sudo systemctl start redis-server
```

#### Step 4: Initialize Database

```bash
# Run migrations
npx prisma migrate deploy

# Seed with test data
npm run seed
```

#### Step 5: Start Application

```bash
# Development (watch mode)
npm run start:dev

# Or production
npm run build
npm run start:prod
```

**Verify:** Visit <http://localhost:3000/api>

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tracking_db"

# Redis (for BullMQ queue)
REDIS_URL="redis://localhost:6379"

# JWT Authentication
JWT_SECRET="your-secret-key-change-in-production-min-32-chars"
JWT_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Application
NODE_ENV="development"
PORT=3000
```

### For Production

```env
NODE_ENV="production"
JWT_SECRET="[use-long-random-key-32+-chars]"
DATABASE_URL="[production-postgres-url]"
REDIS_URL="[production-redis-url]"
```

---

## 💻 Usage

### Test Credentials

Seed automatically creates these test users:

```
ACME Corp:
  Admin:  admin@acme-corp.com / admin123
  User:   user@acme-corp.com / user123

Beta Inc:
  Admin:  admin@beta-inc.com / admin123
  User:   user@beta-inc.com / user123
```

### API Endpoints

#### Authentication

```
POST   /auth/login          Login with email/password → returns access + refresh tokens
POST   /auth/refresh        Refresh access token → returns new token
POST   /auth/logout         Revoke refresh token → invalidates session
```

#### Campaigns

```
POST   /campaigns           Create campaign (admin only)
GET    /campaigns           List tenant's campaigns
GET    /campaigns/:id       Get campaign details
PATCH  /campaigns/:id       Update campaign (admin only)
DELETE /campaigns/:id       Delete campaign (admin only)
```

#### Events (Public)

```
POST   /events/ingest       Ingest event (async, returns 202 Accepted)
                            No auth required, tenant_id in body
```

#### Analytics

```
GET    /analytics/campaigns/:id/daily
       ?startDate=2026-04-01&endDate=2026-04-30
       Get daily event aggregation by type
```

### Example Requests

**Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme-corp.com",
    "password": "admin123"
  }'
```

**Create Campaign:**

```bash
curl -X POST http://localhost:3000/campaigns \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Campaign 2026"
  }'
```

**Ingest Event:**

```bash
curl -X POST http://localhost:3000/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "clx123...",
    "campaignId": "clx456...",
    "eventId": "evt_001",
    "eventType": "page_view",
    "payload": {
      "page": "/shop",
      "user_id": "user_123"
    }
  }'
```

**Get Analytics:**

```bash
curl -X GET "http://localhost:3000/analytics/campaigns/clx456.../daily?startDate=2026-04-01&endDate=2026-04-30" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 🏗️ Architecture

### System Diagram

```
┌─────────────────────────────────────────────┐
│         Client Applications                  │
├─────────────────────────────────────────────┤
│  NestJS API (Port 3000)                     │
│  - Auth Module (JWT)                        │
│  - Campaign Module (CRUD)                   │
│  - Event Module (Public ingestion)          │
│  - Analytics Module (SQL aggregation)       │
├─────────────────────────────────────────────┤
│  PostgreSQL          │    Redis             │
│  - Tenants           │    - BullMQ Queue    │
│  - Users             │    - Event Tasks     │
│  - Campaigns         │    - Cache           │
│  - Events            │                      │
│  - RefreshTokens     │                      │
├─────────────────────────────────────────────┤
│  BullMQ Worker (Auto-started)               │
│  - Processes events                         │
│  - Handles retries                          │
│  - Maintains idempotency                    │
└─────────────────────────────────────────────┘
```

### Data Flow

1. **Event Ingestion**: Client POSTs event → API returns 202 → Event queued in Redis
2. **Event Processing**: BullMQ worker pulls from queue → Validates & deduplicates → Stores in PostgreSQL
3. **Analytics**: User requests aggregation → API queries PostgreSQL → Returns daily counts by event_type

### Idempotency Strategy

**Problem:** Same event could be retried multiple times, creating duplicates.

**Solution:**

- Unique constraint on `(tenantId, eventId)` at database level
- BullMQ handles retries transparently
- Duplicate inserts fail silently at DB layer

---

## 🛠️ Tech Stack

### Why These Technologies?

| Component | Choice | Alternatives | Rationale |
|-----------|--------|--------------|-----------|
| **Framework** | NestJS | Express, Fastify | Type-safe, modular, built-in dependency injection |
| **Language** | TypeScript | JavaScript | Strong typing, better IDE support, fewer runtime errors |
| **Database** | PostgreSQL | MySQL, MongoDB | ACID transactions, excellent relational data support, strong multi-tenant patterns |
| **ORM** | Prisma | TypeORM, Sequelize | Auto-generated types, clean migrations, modern developer experience |
| **Queue** | BullMQ + Redis | AWS SQS, RabbitMQ | Local dev-friendly, built-in retries, low ops overhead |
| **Authentication** | JWT | Sessions, OAuth2 | Stateless, scalable, works with client SDKs and CDNs |
| **Aggregation** | On-demand SQL | Real-time counters | Fast ingestion, flexible queries, no cache invalidation |
| **Testing** | Jest | Mocha, Vitest | Built-in coverage, great NestJS integration, excellent reports |
| **Containerization** | Docker | Kubernetes, Podman | Industry standard, simple, works everywhere |

### Dependency Versions

- **NestJS:** 11.0
- **PostgreSQL:** 16
- **Redis:** 7
- **Prisma:** 5.22
- **Node.js:** 20 (LTS)

---

## ✅ Requirements Mapping

All takehome requirements successfully implemented:

| Requirement | Implementation | Status |
|---|---|---|
| Multi-tenant isolation | Tenant ID enforced at service layer + row-level scoping | ✅ |
| User authentication | JWT with access + refresh tokens, single-use rotation | ✅ |
| Role-based access control | TENANT_ADMIN / TENANT_USER with guards | ✅ |
| Campaign management | Full CRUD with tenant isolation | ✅ |
| Event ingestion | Public async endpoint (202 Accepted) | ✅ |
| Idempotent processing | DB unique constraint on (tenantId, eventId) | ✅ |
| Event deduplication | BullMQ with atomic DB operations | ✅ |
| Analytics/Aggregation | On-demand SQL queries with date ranges | ✅ |
| Database schema | Prisma with 5 core tables + migrations | ✅ |
| Unit testing | 15 tests covering all modules | ✅ |
| Documentation | Swagger + comprehensive README | ✅ |
| Docker containerization | Full stack with auto-migrations and seeding | ✅ |

---

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:cov
```

### Test Modules Covered

- ✅ Auth (login, refresh, logout, validation)
- ✅ Campaigns (CRUD, tenant isolation)
- ✅ Events (ingestion, idempotency)
- ✅ Analytics (aggregation, date ranges)
- ✅ Guards & Decorators (RBAC)

---

## 🚢 Deployment

### Docker Production Build

```bash
# Build image
docker build -t tracking-api:latest .

# Run container
docker run -d \
  --name api \
  -e NODE_ENV="production" \
  -e DATABASE_URL="postgresql://user:pass@db:5432/prod_db" \
  -e REDIS_URL="redis://redis:6379" \
  -e JWT_SECRET="your-long-random-secret" \
  -p 3000:3000 \
  tracking-api:latest
```

### Docker Compose Production

```yaml
# Update docker-compose.yml for production
version: '3.8'
services:
  api:
    build: .
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://...
      REDIS_URL: redis://...
      JWT_SECRET: ...
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
```

### Kubernetes Deployment

```bash
# Create secrets
kubectl create secret generic api-secrets \
  --from-literal=DATABASE_URL=postgresql://... \
  --from-literal=REDIS_URL=redis://... \
  --from-literal=JWT_SECRET=...

# Deploy (create deployment.yaml with pod spec)
kubectl apply -f deployment.yaml
```

### Production Checklist

- [ ] Update `JWT_SECRET` to a secure 32+ character string
- [ ] Configure production PostgreSQL connection
- [ ] Configure production Redis instance
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Set up centralized logging (ELK Stack)
- [ ] Set up error tracking (Sentry)

---

## 🔮 Future Improvements

### Short-term

- **Event Filtering** - Add query parameters to analytics (filter by event_type, user_id)
- **Pagination** - Implement limit/offset for campaigns and events
- **Batch Ingestion** - Accept multiple events in single POST request
- **Rate Limiting** - Per-tenant limits using `@nestjs/throttler`
- **Redis Caching** - Cache frequent queries with TTL strategy
- **Audit Logging** - Track all user actions for compliance

---

## 🐛 Troubleshooting

### Issue: “PrismaClient did not initialize”

**Cause:** Prisma client generator hasn’t run
**Solution:** Run `npx prisma generate` (automatic in Docker)

### Issue: Database connection timeout

**Cause:** PostgreSQL not running or wrong credentials
**Solution:**

```bash
# Check PostgreSQL is running
psql -U postgres -d tracking_db

# Verify DATABASE_URL in .env
```

### Issue: BullMQ workers not processing events

**Cause:** Redis not running or wrong URL
**Solution:**

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### Issue: Port 3000 already in use

**Cause:** Another process using port 3000
**Solution:**

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run start:dev
```

### Issue: JWT token expired or invalid

**Cause:** Token mismatch or expired
**Solution:**

```bash
# Get new access token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "..."}'
```

---

## 📚 Additional Resources

- **API Documentation:** <http://localhost:3000/api>
- **Database Visual:** `npx prisma studio`
- **NestJS Docs:** <https://docs.nestjs.com>
- **Prisma Docs:** <https://www.prisma.io/docs>
- **BullMQ Docs:** <https://docs.bullmq.io>

---

## 📄 License

MIT

---

**Have questions?** Check the [Troubleshooting](#troubleshooting) section or review the Swagger docs at <http://localhost:3000/api>
