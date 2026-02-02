import { prisma } from '../../../config/db.js';
import { Post } from '@prisma/client';

// Define an extended Post type to ensure TypeScript recognizes the thumbnail fields
type ExtendedPost = Post & {
  author: {
    id: string;
    name: string;
    email: string;
  };
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

const updatePost = async (
  id: number,
  data: UpdatePostInput,
  oldThumbnailPublicId?: string
): Promise<Post> => {
  // Delete old thumbnail from Cloudinary BEFORE database transaction if a new one is being uploaded
  if (oldThumbnailPublicId && data.thumbnailPublicId && oldThumbnailPublicId !== data.thumbnailPublicId) {
    console.log('🖼️  Deleting old thumbnail from Cloudinary...');
    console.log('📋 Old Public ID:', oldThumbnailPublicId);
    const { deleteFromCloudinary } = await import('../../../utils/cloudinaryUploader.js');
    await deleteFromCloudinary(oldThumbnailPublicId);
    console.log('✅ Old thumbnail deleted from Cloudinary');
  }

  // Update post in database using transaction
  return prisma.$transaction(async (tx) => {
    console.log('🗄️  Updating post in database...');
    const updatedPost = await tx.post.update({
      where: { id },
      data,
    });
    console.log('✅ Post updated in database successfully');
    return updatedPost;
  });
};

const deletePost = async (id: number): Promise<Post> => {
  // First, find the post outside transaction to get the thumbnailPublicId
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  console.log('🔍 Found post to delete:', { id: post.id, title: post.title });

  // Delete from Cloudinary BEFORE starting database transaction
  if (post.thumbnailPublicId) {
    console.log('🖼️  Post has thumbnail, deleting from Cloudinary first...');
    const { deleteFromCloudinary } = await import('../../../utils/cloudinaryUploader.js');
    await deleteFromCloudinary(post.thumbnailPublicId);
    console.log('✅ Cloudinary asset deleted successfully');
  } else {
    console.log('ℹ️  No thumbnail to delete from Cloudinary');
  }

  // Then delete the post from database using transaction
  return prisma.$transaction(async (tx) => {
    console.log('🗄️  Deleting post from database...');
    const deletedPost = await tx.post.delete({
      where: { id },
    });
    console.log('✅ Post deleted from database successfully');
    
    return deletedPost;
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
};