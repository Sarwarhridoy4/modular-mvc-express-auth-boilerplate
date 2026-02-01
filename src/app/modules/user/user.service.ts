import { SafeUser } from './user.type.js';
import { prisma } from '../../../config/db.js';
import { PrismaQueryBuilder } from '../../../utils/prismaQueryBuilder.js';

const getAllUsers = async (query: Record<string, string>): Promise<{ meta: any, data: SafeUser[] }> => {
  const userQuery = new PrismaQueryBuilder(prisma, 'user', query);

  userQuery.filter().search(['name', 'email']).sort().fields().paginate();

  const meta = await userQuery.getMeta();
  const data = await (userQuery.prismaClient[userQuery.modelName] as any).findMany(userQuery.build());

  return { meta, data };
};

export default {
  getAllUsers,
};