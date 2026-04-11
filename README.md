# Multi-Tenant Website Tracking API

A production-ready NestJS backend for ingesting, processing, and analyzing website events in a multi-tenant architecture.

## Quick Start

### One-Command Setup (Recommended)

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start entire stack (auto-migrates and seeds database)
docker compose up --build
```

**That's it!** The API will:
1. ✅ Start PostgreSQL and Redis
2. ✅ Build and run NestJS container
3. ✅ Automatically run all migrations
4. ✅ Automatically seed test data
5. ✅ Listen on http://localhost:3000

Access:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api
- **Database (Prisma Studio)**: `npx prisma studio` (in another terminal)

### Manual Steps (if needed)

```bash
# Start services separately
docker compose up -d

# Optional: Run migrations manually
npx prisma migrate deploy

# Optional: Seed database manually
npm run seed

# Optional: Start dev server locally (not in container)
npm run start:dev
```

## Architecture

```
┌──────────────────────────────────────────────┐
│  NestJS API (Auth, Campaigns, Events, Analytics)
├──────────────────────────────────────────────┤
│  PostgreSQL    │    Redis + BullMQ           │
│  (Events DB)   │    (Event Queue)            │
├────────────────┴────────────────────────────┤
│  BullMQ Worker (Idempotent Event Processing) │
└──────────────────────────────────────────────┘
```

## Key Features

✅ **Multi-Tenant Isolation** - Strict tenant-scoped data access
✅ **JWT Authentication** - Access tokens + refresh token rotation
✅ **Role-Based Access Control** - TENANT_ADMIN | TENANT_USER
✅ **Event Ingestion** - Public async endpoint, BullMQ-powered
✅ **Idempotent Processing** - Unique DB constraint prevents duplicates
✅ **On-Demand Analytics** - SQL aggregation, date-range flexible
✅ **Campaign Management** - Tenant-scoped CRUD
✅ **Full Test Coverage** - 15+ unit tests, all passing
✅ **Swagger Documentation** - Complete API reference
✅ **Docker Ready** - Fully containerized stack

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Revoke refresh token

### Campaigns
- `POST /campaigns` - Create campaign (admin)
- `GET /campaigns` - List campaigns
- `GET /campaigns/:id` - Get campaign

### Events (Public)
- `POST /events/ingest` - Ingest event (returns 202 Accepted)

### Analytics
- `GET /analytics/campaigns/:id/daily?startDate=...&endDate=...` - Daily aggregation

## Test Credentials

```
ACME Admin:    admin@acme-corp.com / admin123
ACME User:     user@acme-corp.com / user123
Beta Admin:    admin@beta-inc.com / admin123
Beta User:     user@beta-inc.com / user123
```

## Design Decisions

| Aspect | Choice | Why |
|--------|--------|-----|
| Queue | BullMQ + Redis | Production-ready, local-dev friendly, built-in retries |
| Idempotency | DB unique constraint `(tenantId, eventId)` | Atomic, race-safe, no app logic needed |
| Aggregation | On-demand SQL | Fast ingestion, flexible queries, no cache issues |
| Tenant Auth | `tenantId` in JWT + service enforcement | Cannot be spoofed, central isolation point |
| Event Auth | Public (no JWT) | Supports client SDKs, CDN-friendly |

## Tech Stack

- **NestJS 11** - TypeScript framework
- **PostgreSQL 16** - Primary database
- **Redis 7** - Message queue (BullMQ)
- **Prisma 5** - ORM with migrations
- **JWT** - Stateless authentication
- **Swagger** - API documentation
- **Docker** - Containerization

## Development

```bash
# Run tests
npm run test

# Build production
npm run build

# Start production
npm run start:prod

# Lint
npm run lint

# Prisma studio (visual DB explorer)
npx prisma studio
```

## Production Checklist

- [ ] Update JWT secrets in `.env`
- [ ] Configure production PostgreSQL connection
- [ ] Configure production Redis instance
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging

## Project Structure

```
src/
├── main.ts              # Bootstrap & Swagger
├── app.module.ts        # Module wiring
├── auth/                # JWT + RBAC
├── campaigns/           # Campaign CRUD
├── events/              # Event ingestion + processor
├── analytics/           # SQL aggregation
└── common/              # Decorators, guards, filters
```

## Performance Optimizations

- Indexed on `(tenantId, campaignId, processedAt)` for fast aggregation
- Unique constraint on `(tenantId, eventId)` at atomic level
- BullMQ at-least-once delivery with automatic retries
- Raw SQL queries avoid N+1 problems
- Pagination-ready (can add limit/offset)

## Security

- **Passwords**: Bcrypt hashed with salt
- **JWT**: HS256, 32+ chars recommended in prod
- **Refresh Tokens**: Single-use, rotated, hashed in DB
- **Tenant Isolation**: Enforced at service layer (not just SQL filter)
- **Input Validation**: Class-validator on all DTOs
- **Error Messages**: Don't leak internal details

## Support & Resources

- Swagger: `http://localhost:3000/api`
- Database Visual: `npx prisma studio`
- View all routes: Check logs during `npm run start:dev`

## License

MIT
