import { StatusCodes } from "http-status-codes";
import { catchAsync } from '../../../utils/catchAsync.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import userService from './user.service.js';
import type{ Request, Response } from "express";



const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Users fetched successfully",
    data: users,
  });
});



export default {
  getAllUsers,
 
};