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

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
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
