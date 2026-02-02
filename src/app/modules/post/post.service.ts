import { prisma } from '../../../config/db.js';
import { Post } from '@prisma/client';

// Define an extended Post type to ensure TypeScript recognizes the thumbnail fields
type ExtendedPost = Post & {
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
};

type CreatePostInput = {
  title: string;
  content?: string;
  published?: boolean;
  authorId: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
};

type UpdatePostInput = {
  title?: string;
  content?: string;
  published?: boolean;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
};

const createPost = async (data: CreatePostInput): Promise<Post> => {
  return prisma.post.create({
    data,
  });
};

const getAllPosts = async (): Promise<Post[]> => {
  return prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const getSinglePost = async (id: number): Promise<ExtendedPost | null> => {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const updatePost = async (id: number, data: UpdatePostInput): Promise<Post> => {
  return prisma.post.update({
    where: { id },
    data,
  });
};

const deletePost = async (id: number): Promise<Post> => {
  return prisma.post.delete({
    where: { id },
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
};