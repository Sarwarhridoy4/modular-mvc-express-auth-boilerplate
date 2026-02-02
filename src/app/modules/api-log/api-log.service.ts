import { db } from '../../../../config/db';

const clearApiLogs = async () => {
  const result = await db.apiLog.deleteMany({});
  return result;
};

export const apiLogService = {
  clearApiLogs,
};
