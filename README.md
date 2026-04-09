# Logistics Management Platform

A modern logistics management platform for coordinating trucks, drivers, and delivery operations.

## Quick Start

### Prerequisites

- Node.js 20+ LTS
- pnpm 8+
- Docker & Docker Compose

### Setup

```bash
# Install dependencies
pnpm install

# Start database services
pnpm docker:up

# Copy environment files
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate

# Seed database with test data
pnpm db:seed

# Start development servers
pnpm dev
```

### Services

- **API**: http://localhost:3000
- **Web**: http://localhost:5173
- **API Docs**: http://localhost:3000/docs
- **Prisma Studio**: `pnpm db:studio`

### Test Credentials

- Admin: `admin@logistics.com` / `Admin123!`
- Dispatch: `dispatch@logistics.com` / `Admin123!`
- Driver: `driver@logistics.com` / `Admin123!`

## Project Structure

```
logistics-platform/
├── packages/
│   ├── api/          # Fastify backend
│   ├── web/          # React frontend
│   └── shared/       # Shared types & constants
├── docs/
│   ├── BRD.md        # Business Requirements
│   └── WORKFLOW.md   # Development Workflow
└── docker-compose.yml
```

## Scripts

```bash
pnpm dev              # Start all services
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm test             # Run all tests
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database
```

## Documentation

- [Business Requirements Document](docs/BRD.md)
- [Development Workflow](docs/WORKFLOW.md)
