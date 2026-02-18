import { prisma } from '../../../config/db.js';
import { GetErrorLogsInput } from './api-log.validation.js';
import { PrismaQueryBuilder } from '../../../utils/prismaQueryBuilder.js';

const clearApiLogs = async () => {
  const result = await prisma.apiLog.deleteMany({});
  return result;
};

const getPaginatedErrorLogsForAdmin = async (query: GetErrorLogsInput) => {
  const { error, ...restQuery } = query;

  const builderQuery: Record<string, string> = {};

  for (const key in restQuery) {
    const value = restQuery[key as keyof typeof restQuery];
    if (value !== undefined) {
      builderQuery[key] = String(value);
    }
  }

  builderQuery.sort = builderQuery.sort || '-createdAt';

  if (error) {
    builderQuery.searchTerm = error;
  }

  const builder = new PrismaQueryBuilder(prisma, 'apiLog', builderQuery);

  // Explicitly set the statusCode filter for error logs
  builder.prismaOptions.where = {
    ...builder.prismaOptions.where,
    statusCode: {
      gte: 400, // Filter for error status codes (4xx and 5xx)
    },
  };

  builder.filter().search(['error', 'requestBody', 'responseBody']).sort().paginate();

  const prismaOptions = builder.build();

  const logs = await prisma.apiLog.findMany(prismaOptions);
  const meta = await builder.getMeta();

  return { logs, totalCount: meta.total, page: meta.page, limit: meta.limit };
};

export const apiLogService = {
  clearApiLogs,
  getPaginatedErrorLogsForAdmin,
};
