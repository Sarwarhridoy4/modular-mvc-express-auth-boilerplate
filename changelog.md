# Changelog

## 2026-02-03
- Added hashing for OTP codes and password reset tokens before storage.
- Added pagination support for the posts list endpoint (`page`, `limit`) with optional search and sorting parameters.
- Updated Swagger docs for posts list pagination and response metadata.
- Added environment-aware auth cookie settings and session validation in auth middleware.
- Redacted sensitive fields from API logs and skipped auth endpoints for logging.
- Fixed ESM import paths and added Prisma disconnect on graceful shutdown.
