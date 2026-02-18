# Environment Setup Guide

This guide explains how to create a `.env` file and what each variable means.

## 1. Create `.env`

From the project root:

```bash
cp .env.example .env
```

If `cp` is not available, create `.env` manually and paste the same content from `.env.example`.

## 2. Fill Required Values

Update these values before running the app:

- `DATABASE_URL`
- `JWT_ACCESS_TOKEN_SECRET`
- `JWT_REFRESH_TOKEN_SECRET`
- `ADMIN_PASSWORD_HASH` (recommended)
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM`

Generate `ADMIN_PASSWORD_HASH` locally with bcrypt (`bcryptjs`) before placing it in `.env`:

1. Run:

```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('YourStrongAdminPass!2026#A9fL',12).then(h=>console.log(h))"
```

2. Copy the output hash (starts with `$2b$`).
3. Set it in `.env`:

```env
ADMIN_PASSWORD_HASH=$2b$12$your_generated_hash_here
```

## 3. Full `.env` Template

```env
# Server
PORT=5000
NODE_ENV=development

# Frontend (CORS)
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_PRODUCTION=https://your-production-url.com

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Security
BYCRYPT_SALT_ROUNDS=12
ADMIN_PASSWORD_HASH=$2b$12$replace_with_bcrypt_hash
# Optional fallback (not recommended): use a long high-entropy password
# ADMIN_PASSWORD=use_a_long_high_entropy_password

# JWT
JWT_ACCESS_TOKEN_SECRET=replace_with_secure_access_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_SECRET=replace_with_secure_refresh_secret
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
EMAIL_FROM=your_email@gmail.com

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 4. Variable Reference

| Variable | Purpose |
|---------|---------|
| `PORT` | API server port |
| `NODE_ENV` | Runtime mode (`development`, `production`) |
| `FRONTEND_URL` | Local frontend origin for CORS |
| `FRONTEND_URL_PRODUCTION` | Production frontend origin for CORS |
| `DATABASE_URL` | PostgreSQL connection string |
| `BYCRYPT_SALT_ROUNDS` | Bcrypt salt rounds |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash used for seeded admin passwords (recommended) |
| `ADMIN_PASSWORD` | Optional plaintext fallback for seeding (not recommended) |
| `JWT_ACCESS_TOKEN_SECRET` | Access token signing secret |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | Access token lifetime |
| `JWT_REFRESH_TOKEN_SECRET` | Refresh token signing secret |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASSWORD` | SMTP app password/credential |
| `EMAIL_FROM` | Sender address for system emails |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (optional) |
| `CLOUDINARY_API_KEY` | Cloudinary API key (optional) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (optional) |

## 5. Quick Verification

After updating `.env`, run:

```bash
npm run generate
npm run dev
```

If startup fails, check for typo/missing variable names first.
