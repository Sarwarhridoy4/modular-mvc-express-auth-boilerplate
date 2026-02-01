import { StatusCodes } from "http-status-codes";
import { catchAsync } from '../../../utils/catchAsync.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import userService from './user.service.js';
import type{ Request, Response } from "express";



const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { meta, data } = await userService.getAllUsers(req.query as Record<string, string>);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Users fetched successfully",
    meta: meta,
    data: data,
  });
});



export default {
  getAllUsers,
 
};