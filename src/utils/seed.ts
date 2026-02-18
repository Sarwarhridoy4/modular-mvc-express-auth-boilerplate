import { UserRole } from "../constants/userRole.js";
import bcrypt from "bcryptjs";
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * Seeds the database with initial user data for different roles.
 *
 * This script creates default 'SUPER_ADMIN', 'ADMIN', and 'CASHIER' users
 * if they don't already exist. Passwords are hashed using bcrypt.
 * This function is designed to be run as a standalone script for database initialization.
 *
 * @returns {Promise<void>} A promise that resolves when seeding is complete.
 *
 * @example
 * // To run this seeding script, execute from your terminal:
 * // `bun run prisma:seed` (if using bun as package manager and script defined)
 * // or `ts-node src/utils/seed.ts` (if ts-node is configured)
 * // or `node dist/utils/seed.js` (after TypeScript compilation)
 */
async function main() {
  let hashedPassword = env.ADMIN_PASSWORD_HASH;

  if (!hashedPassword) {
    if (!env.ADMIN_PASSWORD) {
      throw new Error(
        "Missing admin seed credential. Set ADMIN_PASSWORD_HASH (recommended) or ADMIN_PASSWORD in .env."
      );
    }

    hashedPassword = await bcrypt.hash(
      env.ADMIN_PASSWORD,
      Number(env.BYCRYPT_SALT_ROUNDS) || 10
    );
  } else if (!BCRYPT_HASH_REGEX.test(hashedPassword)) {
    throw new Error(
      "Invalid ADMIN_PASSWORD_HASH format. Provide a valid bcrypt hash (e.g. starts with $2b$...)."
    );
  }

  // Seed Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@inventory.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@inventory.com",
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  // Seed Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@inventory.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@inventory.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // Seed Cashier
  const cashier = await prisma.user.upsert({
    where: { email: "cashier@inventory.com" },
    update: {},
    create: {
      name: "Cashier User",
      email: "cashier@inventory.com",
      password: hashedPassword,
      role: UserRole.CASHIER,
      isActive: true,
    },
  });

  console.log("✅ Users seeded successfully:");
  console.log("  - Super Admin:", superAdmin.email);
  console.log("  - Admin:", admin.email);
  console.log("  - Cashier:", cashier.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
