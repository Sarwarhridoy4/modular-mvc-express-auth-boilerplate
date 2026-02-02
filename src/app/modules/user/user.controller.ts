import { StatusCodes } from "http-status-codes";
import { catchAsync } from '../../../utils/catchAsync.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import userService from './user.service.js';
import type{ Request, Response } from "express";
import { uploadToCloudinary, deleteFromCloudinary } from '../../../utils/cloudinaryUploader.js';



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

const uploadProfilePicture = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "No file uploaded.",
    });
  }

  const user = req.user;
  if (!user || !user.id) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "User not authenticated.",
    });
  }

  const existingUser = await userService.getSingleUser(user.id);
  if (!existingUser) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: "User not found.",
    });
  }

  // Upload new profile picture
  const { url, publicId } = await uploadToCloudinary(req.file.buffer, `profile-pics/${user.id}`);

  // Delete old profile picture if exists
  if (existingUser.profilePicPublicId) {
    await deleteFromCloudinary(existingUser.profilePicPublicId);
  }

  // Update user in database
  const updatedUser = await userService.updateUserProfilePicture(user.id, url, publicId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile picture uploaded successfully.",
    data: updatedUser,
  });
});



export default {
  getAllUsers,
  uploadProfilePicture,
};