# 🏪 POS Backend - Inventory Management System

A robust and scalable REST API backend for Point of Sale (POS) and Inventory Management System built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Project Overview Flowchart](#project-overview-flowchart)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Email Setup (Gmail Example)](#email-setup-gmail-example)
- [Database Setup](#database-setup)
- [Database Commands Summary](#database-commands-summary)
- [Running the Application](#running-the-application)
- [Development Mode](#development-mode)
- [Production Mode](#production-mode)
- [API Documentation](#api-documentation)
- [Swagger UI](#swagger-ui)
- [Deployment](#deployment)
- [Vercel Deployment](#vercel-deployment)
- [Live Demo](#live-demo)
- [Environment Setup](#environment-setup)
- [Database Migration on Deploy](#database-migration-on-deploy)
- [Security Best Practices](#security-best-practices)
- [Contributing](#contributing)
- [License](#license)

<a id="features"></a>
## ✨ Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (SUPER_ADMIN, ADMIN, CASHIER)
  - Secure password hashing with bcrypt
  - Cookie-based token management
  - **Two-factor authentication with OTP during login**
  - Password reset functionality with secure tokens
  - OTP verification with rate limiting and security features
  - **Advanced OTP attempt tracking with 30-minute sliding window**
  - **Automatic 10-minute account blocking after 3 OTP requests in 30 minutes**
  - 10-minute token expiration for password reset
  - 5-minute OTP expiration for enhanced security
  - Max two active login sessions per user with automatic session management
  - **Welcome email sent upon successful registration**

- 👥 **User Management**
  - User registration and login
  - Role-based user access
  - User profile management
  - Forgot password and reset password flows

- 📝 **Post Management**
  - Create, read, update, and delete posts
  - Image upload with Cloudinary integration
  - Automatic thumbnail management
  - **Atomic operations with Prisma transactions**
  - **Cloudinary asset cleanup before database deletion**
  - **Old thumbnails automatically deleted when uploading new ones**
  - Author-based authorization
  - Admin and Super Admin post management
  - Published/draft status management
  - Multipart form-data `published` field conversion to boolean

- 📊 **API Logging**
  - Comprehensive API request/response logging
  - Error log tracking with filtering
  - Pagination support for log viewing
  - IP address and user tracking
  - Super Admin and Cashier log access

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
  - Query parameter sanitization
  - Proper client IP detection (supports proxies)

- 📚 **Documentation & Observability**
  - Swagger UI with interactive testing, filters, and request duration display
  - Persisted JWT authorization in Swagger UI across refreshes
  - Detailed examples for request and response payloads

- 🗄️ **Database**
  - PostgreSQL with Prisma ORM
  - Type-safe database queries
  - Database migrations and seeding
  - Prisma Studio for database visualization
  - Transaction support for atomic operations

<a id="tech-stack"></a>
## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma 7.x
- **Media Storage:** Cloudinary
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Email:** Nodemailer
- **Password Hashing:** bcryptjs
- **HTTP Status:** http-status-codes
- **API Docs:** Swagger UI (OpenAPI)

<a id="project-structure"></a>
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

<a id="project-overview-flowchart"></a>
## 🧭 Project Overview Flowchart

```mermaid
flowchart TD
  Client[Web/Mobile Client] -->|HTTP| API[Express API]
  API --> Swagger[Swagger UI / OpenAPI]
  API --> Middleware[Middleware: Auth, RBAC, Validation, Rate Limit]
  Middleware --> Routes[Route Handlers]
  Routes --> Modules[Modules: Auth, User, Post, API Log]
  Modules --> Prisma[Prisma ORM]
  Prisma --> DB[(PostgreSQL)]
  Modules --> Cloudinary[Cloudinary]
  Modules --> Email[Nodemailer/SMTP]
  Modules --> Logs[(API Logs)]
```

<a id="prerequisites"></a>
## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **bun** package manager
- **Git**

<a id="installation"></a>
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

<a id="environment-variables"></a>
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

<a id="email-setup-gmail-example"></a>
### 📧 Email Setup (Gmail Example)

For Gmail SMTP:

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `SMTP_PASSWORD`

<a id="database-setup"></a>
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

<a id="database-commands-summary"></a>
### Database Commands Summary

Here is a summary of essential Prisma commands for managing your database:

| Command                   | Description                                                                                                                                                                                                                                                                                                                           | Usage Notes                                                                                                                                                                                                           |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run generate`        | Generates the Prisma Client based on your `schema.prisma` file. This command should be run whenever your Prisma schema changes to ensure your application can interact with the updated database schema. It is often run automatically during `postinstall`.                                                                          | **Before:** Ensure your `schema.prisma` is up-to-date with your desired database structure.                                                                                                                             |
| `npm run migrate:dev`     | Creates new migration files based on changes in your Prisma schema, applies them to the database, and then generates the Prisma Client. This is typically used during development.                                                                                                                                                      | **Before:** Make sure your `schema.prisma` reflects the desired changes. **After:** Verify that the migration ran successfully and the Prisma Client is regenerated.                                                   |
| `npm run migrate:deploy`  | Applies pending migrations to the database in a production environment. This command does not create new migrations; it only applies existing ones.                                                                                                                                                                                   | **Before:** Ensure all migration files are present and correctly versioned in your deployment environment. **After:** Confirm that the database schema is up-to-date with the deployed application's schema.             |
| `npm run db:push`         | Pushes the current state of your Prisma schema to the database without creating a migration. Useful for rapid development and prototyping or when you are certain no data loss will occur.                                                                                                                                            | **Caution:** This command can lead to data loss if used on a database with existing data that conflicts with schema changes. Only use in development or when you are sure about the data implications.                 |
| `npm run migrate:reset`   | Resets your database by dropping all data and tables, then re-applies all migrations from scratch, and optionally seeds the database. Useful for cleaning up and restarting your database state during development.                                                                                                                  | **Caution:** This will irrevocably delete all data in your database. Only use in development environments where data loss is acceptable.                                                                                 |
| `npm run studio`          | Opens Prisma Studio, a visual editor for your database. It allows you to view, edit, and manage your data directly.                                                                                                                                                                                                                 | Useful for inspecting data and debugging during development.                                                                                                                                                            |
| `npm run seed`            | Runs the seeding script to populate your database with initial data.                                                                                                                                                                                                                                                                  | **Before:** Ensure your database schema is up-to-date (`migrate:dev` or `migrate:deploy`). **After:** Verify that the expected data has been inserted into the database.                                             |

<a id="running-the-application"></a>
## 🏃 Running the Application

<a id="development-mode"></a>
### Development Mode

```bash
npm run dev
# or
bun run dev
```

The server will start at `http://localhost:5000` with hot-reload enabled.

<a id="production-mode"></a>
### Production Mode

1. **Build the project**

```bash
npm run build
```

2. **Start the server**

```bash
npm start
```

<a id="api-documentation"></a>
## 📡 API Documentation

For detailed API documentation, please see the [API Documentation Index](./docs/index.md) file.
- Centralized API documentation now available under the `docs/` directory, providing detailed endpoints for Authentication, User Management, and more.

<a id="swagger-ui"></a>
## 📄 Swagger UI

This project includes Swagger UI for interactive API documentation. You can access it when the application is running.

- **URL:** `http://localhost:5000/api-docs/`

---

<a id="deployment"></a>
## 🚀 Deployment

<a id="vercel-deployment"></a>
### Vercel Deployment

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy**

```bash
vercel --prod
```

<a id="live-demo"></a>
### Live Demo

You can access the live demo of the application here: [POS Inventory Backend](https://pos-inventory-backend-sable.vercel.app)

<a id="environment-setup"></a>
### Environment Setup

Make sure to set all environment variables in your deployment platform:

- Vercel: Project Settings → Environment Variables
- Heroku: Config Vars
- AWS/DigitalOcean: Environment configuration

<a id="database-migration-on-deploy"></a>
### Database Migration on Deploy

```bash
npm run migrate:deploy
```

<a id="security-best-practices"></a>
## 🛡️ Security Best Practices

- ✅ All passwords are hashed using bcrypt
- ✅ JWT tokens with expiration
- ✅ Password reset tokens with 10-minute expiration
- ✅ OTP-based login with 5-minute code expiration
- ✅ Advanced rate limiting for OTP requests:
  - 30-minute sliding window for attempt tracking
  - Maximum 3 OTP requests per 30-minute window
  - Automatic 10-minute account blocking after exceeding limit
  - Window resets automatically after expiration
- ✅ Secure token generation using crypto.randomBytes
- ✅ CORS protection enabled
- ✅ Input validation using Zod schemas
- ✅ Environment variables for sensitive data
- ✅ Role-based access control (RBAC)
- ✅ Global error handling
- ✅ Email verification for password resets and OTP delivery
- ✅ Automatic session management (max 2 concurrent devices)

<a id="contributing"></a>
## 🤝 Contributing

We welcome contributions to this project! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for details on how to get started.

<a id="license"></a>
## 📝 License

This project is private and proprietary.
