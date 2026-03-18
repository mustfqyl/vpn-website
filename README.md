# Secure VPN Customer Portal

A production-ready, security-focused Next.js VPN customer portal integrated with PasarGuard (Marzban) VPN panels.

## 🏗 Architecture

- **Frontend/Backend**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT based with Redis blacklist & HMAC-SHA256 Auth Codes
- **Cache/Blacklist**: Redis (Upstash supported)
- **Containerization**: Docker & Docker Compose
- **Logging**: Structured logging with Pino

## 🚀 Quick Start

### 1. Prerequisite
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL & Redis (if running locally without Docker)

### 2. Configuration
Copy `.env.example` to `.env` and fill in the required variables:
```bash
cp .env.example .env
```

### 3. Running with Docker (Recommended)
```bash
docker-compose up -d --build
```
This will start the application at `http://localhost:3000`, along with a PostgreSQL instance.

### 4. Local Development
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens | Yes |
| `AUTH_SECRET` | Secret key for Auth Code generation | Yes |
| `VPN_PANEL_API_URL` | API URL of your PasarGuard panel | Yes |
| `VPN_PANEL_ADMIN_USERNAME` | Admin username for the VPN panel | Yes |
| `VPN_PANEL_ADMIN_PASSWORD` | Admin password for the VPN panel | Yes |
| `UPSTASH_REDIS_REST_URL` | Redis URL for JWT blacklisting | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token for authentication | Yes |

## 🛠 Features

- **Automated Registration**: Users can generate unique VPN codes and register.
- **VPN Sync**: Reconciles user status between the portal and the VPN panel.
- **Health Checks**: Monitors Database and VPN Panel connectivity.
- **Production-Ready**: Resource limits, security headers, and structured logging.

## 🧪 Testing

```bash
npm test
```

## 📄 License
Private/Proprietary
