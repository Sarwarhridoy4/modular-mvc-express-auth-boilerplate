import { SafeUser } from "./user.type";
import { prisma } from "../../../config/db";

const getAllUsers = async (): Promise<SafeUser[]> => {
  return prisma.user.findMany({
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
};

export default {
  getAllUsers,
};