# Modular MVC Express Boilerplate (Prisma)

A production-ready boilerplate built with Node.js, Express, Prisma ORM, and PostgreSQL.
It follows a modular MVC-style architecture and includes authentication, authorization, validation, logging, and API documentation out of the box.

## Features

- Modular feature-based architecture (`auth`, `user`, `post`, `api-log`)
- JWT authentication (cookie + bearer token support)
- Role-based authorization (RBAC)
- OTP login verification and password reset flow
- Session tracking with active-session validation
- Zod request validation
- Centralized error handling and consistent API responses
- Prisma ORM with PostgreSQL migrations
- Swagger/OpenAPI docs at `/api-docs`
- Optional Cloudinary media upload integration

## Architecture

- Route -> Controller -> Service -> Prisma
- Shared middleware for auth, validation, logging, and error handling
- Environment-based configuration for local and production

## Tech Stack

- Node.js + Express 5
- PostgreSQL
- Prisma
- Zod
- JWT + cookies
- Nodemailer
- Swagger UI (OpenAPI)

## Project Structure

```text
.
├── prisma/
│   ├── migrations/
│   ├── models/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── middleware/
│   │   └── modules/
│   ├── config/
│   ├── helpers/
│   ├── routes/
│   ├── types/
│   └── utils/
├── app.ts
├── server.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (18+)
- PostgreSQL
- npm or bun

### Installation

```bash
git clone <repository-url>
cd project
npm install
npm run generate
```

## Environment Variables

Create `.env` based on `.env.example` and set values like:

### How to get `ADMIN_PASSWORD_HASH`

1. Run:

```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('YourStrongAdminPass!2026#A9fL',12).then(h=>console.log(h))"
```

2. Copy the output hash (starts with `$2b$`).
3. Put it in `.env`:

```env
ADMIN_PASSWORD_HASH=$2b$12$your_generated_hash_here
```

```env
PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
FRONTEND_URL_PRODUCTION=https://your-frontend.com

DATABASE_URL=postgresql://username:password@localhost:5432/your_db

BYCRYPT_SALT_ROUNDS=12
ADMIN_PASSWORD_HASH=$2b$12$replace_with_bcrypt_hash
# Optional fallback (not recommended)
# ADMIN_PASSWORD=use_a_long_high_entropy_password

JWT_ACCESS_TOKEN_SECRET=your_access_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_SECRET=your_refresh_secret
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@example.com
```

For a complete setup walkthrough and variable explanations, see [`docs/environment-setup.md`](./docs/environment-setup.md).

## Database

```bash
npm run migrate:dev
npm run seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development mode |
| `npm run build` | Build app |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run migrate:dev` | Create/apply migration |
| `npm run migrate:deploy` | Apply migrations in deployment |
| `npm run generate` | Generate Prisma client |
| `npm run studio` | Open Prisma Studio |
| `npm run seed` | Seed local database |

## Authentication & Authorization

- Access + refresh token flow
- Route protection via `checkAuth(...)`
- RBAC roles: `SUPER_ADMIN`, `ADMIN`, `CASHIER`
- Role constants are maintained in `src/constants/userRole.ts` for runtime compatibility
- OTP verification for login
- Session validation through DB-backed session records

## Deployment Notes

- This project uses ESM; internal relative imports should include `.js` in source imports for reliable runtime resolution after build.
- If deployment reports `Module "@prisma/client" has no exported member "UserRole"`, use `src/constants/userRole.ts` (already applied) instead of importing `UserRole` from Prisma client.
- Admin seed/login credential is hash-first via `ADMIN_PASSWORD_HASH` (bcrypt). Plaintext `ADMIN_PASSWORD` is fallback only.

## API Documentation

- Swagger UI: `http://localhost:5000/api-docs`
- Base URL: `http://localhost:5000/api/v1`
- Additional docs: [`docs/`](./docs)

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).
