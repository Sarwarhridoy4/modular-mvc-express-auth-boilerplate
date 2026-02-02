import { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync';
import { apiLogService } from './api-log.service';
import { sendResponse } from '../../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

const clearApiLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await apiLogService.clearApiLogs();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'API logs cleared successfully',
    data: result,
  });
});

export const apiLogController = {
  clearApiLogs,
};
