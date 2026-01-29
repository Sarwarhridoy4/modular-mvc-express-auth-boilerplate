# 🏪 POS Backend - Inventory Management System

A robust and scalable REST API backend for Point of Sale (POS) and Inventory Management System built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Security Best Practices](#security-best-practices)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (SUPER_ADMIN, ADMIN, CASHIER)
  - Secure password hashing with bcrypt
  - Cookie-based token management
  - **Two-factor authentication with OTP during login**
  - Password reset functionality with secure tokens
  - OTP verification with rate limiting and security features
  - 10-minute token expiration for password reset
  - 5-minute OTP expiration for enhanced security
  - Max two active login sessions per user

- 👥 **User Management**
  - User registration and login
  - Role-based user access
  - User profile management
  - Forgot password and reset password flows

- 📧 **Email Service**
  - Nodemailer integration with SMTP support
  - EJS templating for emails
  - Support for attachments

- 🛡️ **Security Features**
  - CORS protection
  - Input validation with Zod
  - **Consistent JSON error responses**
  - Global error handling with proper categorization
  - Environment-based configuration
  - Validation errors with detailed messages

- 🗄️ **Database**
  - PostgreSQL with Prisma ORM
  - Type-safe database queries
  - Database migrations and seeding
  - Prisma Studio for database visualization

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma 7.x
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Email:** Nodemailer
- **Password Hashing:** bcryptjs
- **HTTP Status:** http-status-codes

## 📁 Project Structure

```
POS_Backend/Inventory/
├── prisma/
│   ├── migrations/        # Database migrations
│   ├── models/           # Prisma model files
│   │   ├── User.prisma
│   │   └── Post.prisma
│   └── schema.prisma     # Main Prisma schema
├── src/
│   ├── app/
│   │   ├── interfaces/   # TypeScript interfaces
│   │   ├── middleware/   # Express middlewares
│   │   │   ├── CheckAuth.ts
│   │   │   ├── zodValidator.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   └── notFound.ts
│   │   └── modules/      # Feature modules
│   │       ├── auth/     # Authentication module
│   │       └── user/     # User module
│   ├── config/           # Configuration files
│   │   ├── db.ts        # Database connection
│   │   └── env.ts       # Environment variables
│   ├── helpers/
│   │   └── errorHelper/
│   │       └── AppError.ts
│   ├── routes/          # API routes
│   │   └── index.ts
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
│       ├── catchAsync.ts
│       ├── jwt.ts
│       ├── otpGenerator.ts    # OTP generation and validation
│       ├── sendEmail.ts
│       ├── sendResponse.ts
│       ├── setCookie.ts
│       ├── userTokens.ts
│       ├── tokenGenerator.ts   # Token generation utilities
│       └── seed.ts
├── app.ts               # Express app setup
├── server.ts            # Server entry point
├── prisma.config.ts     # Prisma configuration
└── tsconfig.json        # TypeScript configuration
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **bun** package manager
- **Git**

## 🔧 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd POS_Backend/Inventory
```

2. **Install dependencies**

Using npm:

```bash
npm install
```

Using bun:

```bash
bun install
```

3. **Generate Prisma Client**

```bash
npm run generate
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_PRODUCTION=https://your-production-url.com

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/inventory_db

# Security
BYCRYPT_SALT_ROUNDS=12
ADMIN_PASSWORD=your_secure_admin_password

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret_key
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@example.com
```

### 📧 Email Setup (Gmail Example)

For Gmail SMTP:

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `SMTP_PASSWORD`

## 🗄️ Database Setup

1. **Create PostgreSQL database**

```bash
createdb inventory_db
```

2. **Run migrations**

```bash
npm run migrate:dev
```

3. **Seed the database (optional)**

```bash
npm run seed
```

4. **Open Prisma Studio (optional)**

```bash
npm run studio
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
# or
bun run dev
```

The server will start at `http://localhost:5000` with hot-reload enabled.

### Production Mode

1. **Build the project**

```bash
npm run build
```

2. **Start the server**

```bash
npm start
```

## 📡 API Documentation

For detailed API documentation, please see the [API Documentation Index](./docs/index.md) file.
- Centralized API documentation now available under the `docs/` directory, providing detailed endpoints for Authentication, User Management, and more.

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy**

```bash
vercel --prod
```

### Environment Setup

Make sure to set all environment variables in your deployment platform:

- Vercel: Project Settings → Environment Variables
- Heroku: Config Vars
- AWS/DigitalOcean: Environment configuration

### Database Migration on Deploy

```bash
npm run migrate:deploy
```

## 🛡️ Security Best Practices

- ✅ All passwords are hashed using bcrypt
- ✅ JWT tokens with expiration
- ✅ Password reset tokens with 10-minute expiration
- ✅ OTP-based login with 5-minute code expiration
- ✅ Rate limiting for OTP requests (3 attempts per 30 minutes, 10-minute block)
- ✅ Secure token generation using crypto.randomBytes
- ✅ CORS protection enabled
- ✅ Input validation using Zod schemas
- ✅ Environment variables for sensitive data
- ✅ Role-based access control (RBAC)
- ✅ Global error handling
- ✅ Email verification for password resets and OTP delivery

## 🤝 Contributing

We welcome contributions to this project! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for details on how to get started.

## 📝 License

This project is private and proprietary.