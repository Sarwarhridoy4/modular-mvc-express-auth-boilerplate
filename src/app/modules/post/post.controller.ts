import { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { StatusCodes } from 'http-status-codes';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../utils/cloudinaryUploader.js';
import { postService } from './post.service.js';
import { prisma } from '../../../config/db.js';


const createPost = catchAsync(async (req: Request, res: Response) => {
  const { title, content, published } = req.body;
  const authorId = req.user?.id;

  if (!authorId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "User not authenticated.",
    });
  }

  let thumbnailUrl: string | undefined;
  let thumbnailPublicId: string | undefined;

  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.buffer, `post-thumbnails/${authorId}`);
    thumbnailUrl = uploadResult.url;
    thumbnailPublicId = uploadResult.publicId;
  }

  const newPost = await postService.createPost({
    title,
    content,
    published,
    authorId,
    thumbnailUrl,
    thumbnailPublicId,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Post created successfully',
    data: newPost,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const posts = await postService.getAllPosts();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts retrieved successfully',
    data: posts,
  });
});

const getSinglePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await postService.getSinglePost(Number(id));
  if (!post) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Post not found',
    });
  }
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post retrieved successfully',
    data: post,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, published } = req.body;
  const authorId = req.user?.id;

  if (!authorId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "User not authenticated.",
    });
  }

  const existingPost = await postService.getSinglePost(Number(id));

  if (!existingPost || existingPost.authorId !== authorId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      message: 'You are not authorized to update this post or post not found',
    });
  }

  let thumbnailUrl: string | undefined = existingPost.thumbnailUrl || undefined;
  let thumbnailPublicId: string | undefined = existingPost.thumbnailPublicId || undefined;

  if (req.file) {
    // Delete old thumbnail from Cloudinary if exists
    if (existingPost.thumbnailPublicId) {
      await deleteFromCloudinary(existingPost.thumbnailPublicId);
    }
    const uploadResult = await uploadToCloudinary(req.file.buffer, `post-thumbnails/${authorId}`);
    thumbnailUrl = uploadResult.url;
    thumbnailPublicId = uploadResult.publicId;
  } else if (req.body.deleteThumbnail && existingPost.thumbnailPublicId) {
    // If deleteThumbnail flag is sent and a thumbnail exists, delete it
    await deleteFromCloudinary(existingPost.thumbnailPublicId);
    thumbnailUrl = undefined;
    thumbnailPublicId = undefined;
  }

  const updatedPost = await postService.updatePost(Number(id), {
    title,
    content,
    published,
    thumbnailUrl,
    thumbnailPublicId,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post updated successfully',
    data: updatedPost,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const authorId = req.user?.id;

  if (!authorId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "User not authenticated.",
    });
  }

  const existingPost = await postService.getSinglePost(Number(id));

  if (!existingPost || existingPost.authorId !== authorId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      message: 'You are not authorized to delete this post or post not found',
    });
  }

  // Delete thumbnail from Cloudinary if exists
  if (existingPost.thumbnailPublicId) {
    await deleteFromCloudinary(existingPost.thumbnailPublicId);
  }

  const deletedPost = await postService.deletePost(Number(id));

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post deleted successfully',
    data: deletedPost,
  });
});

export const postController = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
};