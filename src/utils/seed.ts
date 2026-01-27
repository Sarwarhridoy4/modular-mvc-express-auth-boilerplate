import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';

async function main() {
  const hashedPassword = await bcrypt.hash(
    env.ADMIN_PASSWORD || "admin123",
    Number(env.BYCRYPT_SALT_ROUNDS) || 10
  );

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
