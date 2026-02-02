import { prisma } from '../../../config/db.js';

const clearApiLogs = async () => {
  const result = await prisma.apiLog.deleteMany({});
  return result;
};

export const apiLogService = {
  clearApiLogs,
};
