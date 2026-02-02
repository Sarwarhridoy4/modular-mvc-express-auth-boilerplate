import { UserRole } from "@prisma/client";

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  profilePicUrl?: string | null;
  profilePicPublicId?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
