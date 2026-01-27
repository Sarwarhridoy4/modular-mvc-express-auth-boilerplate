import { SafeUser } from './user.type.js';
import { prisma } from '../../../config/db.js';

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