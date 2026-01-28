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
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

## ✨ Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (SUPER_ADMIN, ADMIN, CASHIER)
  - Secure password hashing with bcrypt
  - Cookie-based token management
  - Password reset functionality with secure tokens
  - 10-minute token expiration for security

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
  - Global error handling
  - Environment-based configuration

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

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Sign Up

```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CASHIER"
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### Logout

```http
POST /api/v1/auth/logout
```

#### Forgot Password

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset email sent successfully",
  "data": null
}
```

#### Reset Password

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": null
}
```

### User Endpoints

#### Get All Users (Admin Only)

```http
GET /api/v1/users
Authorization: Bearer <access_token>
```

### User Roles

- **SUPER_ADMIN**: Full system access
- **ADMIN**: Administrative access
- **CASHIER**: Basic access (default role)

## 📜 Available Scripts

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `npm run dev`            | Start development server with hot-reload |
| `npm run build`          | Build TypeScript to JavaScript           |
| `npm start`              | Start production server                  |
| `npm run lint`           | Run ESLint                               |
| `npm run lint:fix`       | Fix ESLint errors                        |
| `npm run migrate:dev`    | Run database migrations (development)    |
| `npm run migrate:deploy` | Run database migrations (production)     |
| `npm run generate`       | Generate Prisma Client                   |
| `npm run reset`          | Reset database and migrations            |
| `npm run update`         | Push schema changes to database          |
| `npm run studio`         | Open Prisma Studio                       |
| `npm run seed`           | Seed the database                        |

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
- ✅ Secure token generation using crypto.randomBytes
- ✅ CORS protection enabled
- ✅ Input validation using Zod schemas
- ✅ Environment variables for sensitive data
- ✅ Role-based access control (RBAC)
- ✅ Global error handling
- ✅ Email verification for password resets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👨‍💻 Author

Built with ❤️ for Inventory Management System

## 🐛 Known Issues

- None currently reported

## 📞 Support

For support, email support@example.com

---

## 📚 Additional Documentation

For detailed information about the password reset feature, see:

- [Password Reset Feature Guide](./PASSWORD_RESET_FEATURE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Complete Guide](./PASSWORD_RESET_COMPLETE_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE.md)

---

**Note:** Make sure to keep your `.env` file secure and never commit it to version control. The `.env` file contains sensitive information like database credentials and API keys.

## To run

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.6. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
