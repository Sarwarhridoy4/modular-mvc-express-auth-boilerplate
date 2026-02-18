export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
