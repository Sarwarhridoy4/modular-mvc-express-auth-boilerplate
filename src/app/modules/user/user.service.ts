import { SafeUser } from './user.type.js';
import { prisma } from '../../../config/db.js';
import { PrismaQueryBuilder } from '../../../utils/prismaQueryBuilder.js';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

const SAFE_USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  profilePicUrl: true,
  profilePicPublicId: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const getAllowedSelect = (fields?: string): Record<string, boolean> => {
  if (!fields) return { ...SAFE_USER_FIELDS };

  const allowed = Object.keys(SAFE_USER_FIELDS);
  const requested = fields.split(',').map((field) => field.trim()).filter(Boolean);
  const filtered = requested.filter((field) => allowed.includes(field));

  // Always return at least the safe defaults if nothing valid is requested
  if (filtered.length === 0) return { ...SAFE_USER_FIELDS };

  return filtered.reduce((acc, field) => {
    acc[field] = true;
    return acc;
  }, {} as Record<string, boolean>);
};

const getAllUsers = async (query: Record<string, string>): Promise<{ meta: PaginationMeta, data: SafeUser[] }> => {
  const userQuery = new PrismaQueryBuilder(prisma, 'user', query);

  userQuery.filter().search(['name', 'email']).sort().fields().paginate();
  userQuery.prismaOptions.select = getAllowedSelect(query.fields);

  const meta = await userQuery.getMeta();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await (userQuery.prismaClient[userQuery.modelName] as any).findMany(userQuery.build());

  return { meta, data };
};

const getSingleUser = async (id: string): Promise<SafeUser | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: { ...SAFE_USER_FIELDS },
  });
};

const updateUserProfilePicture = async (
  userId: string,
  profilePicUrl: string,
  profilePicPublicId: string
): Promise<SafeUser> => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      profilePicUrl,
      profilePicPublicId,
    },
  });
};

export default {
  getAllUsers,
  getSingleUser,
  updateUserProfilePicture,
};
