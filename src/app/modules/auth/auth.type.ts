import { UserRole } from "@prisma/client";

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export interface UserWithTokens {
  id: string;
  name: string;
  email: string;
  role: UserRole;
isActive: boolean;
  createdAt: Date;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
