import { UserRole } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { env } from '../../../config/env.js';
import AppError from '../../../helpers/errorHelper/AppError.js';
import { LoginPayload, SignupPayload, UserWithTokens } from './auth.type.js';
import { StatusCodes } from "http-status-codes";
import { createUserTokens } from '../../../utils/userTokens.js';
import { prisma } from '../../../config/db.js';

const signupUser = async (payload: SignupPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existingUser)
    throw new AppError(400, "User already exists with this email");

  const hashedPassword = await bcryptjs.hash(
    payload.password,
    Number(env.BYCRYPT_SALT_ROUNDS)
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role || UserRole.CASHIER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const loginWithEmailAndPassword = async (
  payload: LoginPayload
): Promise<UserWithTokens> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  const isPasswordValid = await bcryptjs.compare(
    payload.password,
    user.password
  );
  if (!isPasswordValid)
    throw new AppError(StatusCodes.UNAUTHORIZED, "Password is incorrect!");

  const tokens = createUserTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...safeUser } = user;
  return { ...safeUser, tokens };
};


export default {
  signupUser,
  loginWithEmailAndPassword,
};