# Logistics Management Platform

A modern logistics management platform deployable on Vercel with serverless architecture.

## Features

- **Driver Management** - Create and manage drivers with license tracking
- **Unit Management** - Manage vehicles with insurance and registration tracking
- **Client Management** - Client database with contacts and locations
- **Job Management** - Create and track delivery jobs
- **Assignment System** - Assign drivers and units to jobs with conflict detection
- **Event Logging** - Complete audit trail of all actions
- **Dashboard & Reports** - Real-time stats and performance metrics
- **Mobile-Optimized Driver Interface** - One-click status updates

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + TanStack Query
- **Backend**: Fastify (Node.js 20)
- **Database**: PostgreSQL (Vercel Postgres / Supabase / Neon)
- **Cache**: Redis (Upstash Redis)
- **ORM**: Prisma
- **Deployment**: Vercel (Serverless Functions)

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL database
- Redis instance (Upstash recommended)

## Local Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Create .env file
cp .env.example .env

# Run migrations
pnpm db:migrate:dev

# Seed database
pnpm db:seed

# Start development servers
pnpm dev
```

**Services:**
- Frontend: http://localhost:5173
- API: http://localhost:3000

**Test Credentials:**
- Admin: `admin@logistics.com` / `Admin123!`
- Dispatch: `dispatch@logistics.com` / `Admin123!`
- Driver: `driver@logistics.com` / `Admin123!`

## Deployment to Vercel

### 1. Setup External Services

**Database Options:**
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com) (recommended - free tier)
- [Neon](https://neon.tech)
- [Railway](https://railway.app)

**Redis:**
- [Upstash Redis](https://upstash.com) (recommended for serverless)

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### 3. Configure Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Upstash Redis URL |
| `JWT_SECRET` | Random 64-char string |
| `CORS_ORIGIN` | Your app URL |

### 4. Run Migrations

After deployment:

```bash
vercel env pull .env.production
pnpm db:migrate
```

## Project Structure

```
logistics-platform/
├── api/                    # Vercel serverless API
│   ├── lib/               # Utilities
│   ├── routes/            # API handlers
│   └── prisma/            # Database schema
├── packages/
│   └── web/               # React frontend
├── docs/                   # Documentation
├── vercel.json            # Vercel config
└── package.json           # Root package
```

## API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Drivers
- `GET /api/drivers`
- `POST /api/drivers`
- `GET/PUT/DELETE /api/drivers/:id`

### Units
- `GET /api/units`
- `POST /api/units`
- `GET/PUT/DELETE /api/units/:id`

### Clients
- `GET /api/clients`
- `POST /api/clients`
- `GET/PUT/DELETE /api/clients/:id`

### Jobs
- `GET /api/jobs`
- `POST /api/jobs`
- `GET/PUT/DELETE /api/jobs/:id`
- `POST /api/jobs/:id/cancel`

### Assignments
- `GET /api/assignments`
- `POST /api/assignments`
- `GET /api/assignments/:id`
- `POST /api/assignments/:id/status`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL |
| `REDIS_URL` | Yes | Redis URL |
| `JWT_SECRET` | Yes | JWT secret |
| `CORS_ORIGIN` | No | CORS origin |

## Documentation

- [Business Requirements](docs/BRD.md)
- [Development Workflow](docs/WORKFLOW.md)

## License

MIT
