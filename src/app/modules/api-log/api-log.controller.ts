import { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync';
import { apiLogService } from './api-log.service';
import { sendResponse } from '../../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { GetErrorLogsInput } from './api-log.validation';

const clearApiLogs = catchAsync(async (_req: Request, res: Response) => {
  const result = await apiLogService.clearApiLogs();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'API logs cleared successfully',
    data: result,
  });
});

const getPaginatedErrorLogs = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetErrorLogsInput['query'];
  const { logs, totalCount, page, limit } = await apiLogService.getPaginatedErrorLogsForAdmin(query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Error logs retrieved successfully',
    data: {
      logs,
      meta: {
        page,
        limit,
        total: totalCount,
      },
    },
  });
});

export const apiLogController = {
  clearApiLogs,
  getPaginatedErrorLogs,
};
