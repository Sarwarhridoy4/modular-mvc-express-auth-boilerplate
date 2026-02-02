import { Router } from 'express';
import { checkAuth } from '../../middleware/CheckAuth.js';
import { UserRole } from '@prisma/client';
import { upload } from '../../../config/multer.config.js';
import { postController } from './post.controller.js';

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Post management and operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PostInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the post.
 *         content:
 *           type: string
 *           description: The content of the post.
 *         published:
 *           type: boolean
 *           description: Whether the post is published.
 *           default: false
 *     PostResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *         title:
 *           type: string
 *         content:
 *           type: string
 *           nullable: true
 *         thumbnailUrl:
 *           type: string
 *           format: url
 *           nullable: true
 *         thumbnailPublicId:
 *           type: string
 *           nullable: true
 *         published:
 *           type: boolean
 *         authorId:
 *           type: string
 *         author:
 *           $ref: '#/components/schemas/UserResponseMinimal'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PostListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PostResponse'
 *     UserResponseMinimal:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: string
 */

const router = Router();

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post (Admin/Cashier only)
 *     description: |
 *       Creates a new post with optional thumbnail image.
 *       
 *       **Testing in Swagger UI:**
 *       1. Click "Try it out"
 *       2. Fill in the form fields
 *       3. For thumbnail: Click "Choose File" and select an image
 *       4. Click "Execute"
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My First Post"
 *                 description: The title of the post
 *               content:
 *                 type: string
 *                 example: "This is the post content"
 *                 description: The content/body of the post
 *               published:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 example: 'false'
 *                 description: Whether the post should be published (use string 'true' or 'false')
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Post thumbnail image (optional)
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Post created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  checkAuth(UserRole.ADMIN, UserRole.CASHIER),
  upload.single('thumbnail'),
  postController.createPost
);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts (Public endpoint)
 *     description: Retrieve a list of all posts. This endpoint is public and does not require authentication.
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: A list of posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostListResponse'
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Posts retrieved successfully"
 *               data: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', postController.getAllPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to retrieve.
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Post retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PostResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', postController.getSinglePost);

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Update an existing post (Admin/Cashier only)
 *     description: |
 *       Updates an existing post. Only the post author can update it.
 *       
 *       **Features:**
 *       - Upload new thumbnail (old one will be automatically deleted from Cloudinary)
 *       - Delete existing thumbnail by setting deleteThumbnail to true
 *       - Update title, content, or published status
 *       
 *       **Testing in Swagger UI:**
 *       1. Click "Try it out"
 *       2. Enter the post ID in the path parameter
 *       3. Fill in the fields you want to update
 *       4. To replace thumbnail: Upload a new file
 *       5. To delete thumbnail: Set deleteThumbnail to true
 *       6. Click "Execute"
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: The ID of the post to update
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Post Title"
 *                 description: New title for the post
 *               content:
 *                 type: string
 *                 example: "Updated content"
 *                 description: New content for the post
 *               published:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 example: 'true'
 *                 description: Publish status (use string 'true' or 'false')
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: New thumbnail image (will replace existing one)
 *               deleteThumbnail:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 example: 'false'
 *                 description: Set to 'true' to delete the existing thumbnail
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Post updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not authorized to update this post)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id',
  checkAuth(UserRole.ADMIN, UserRole.CASHIER),
  upload.single('thumbnail'),
  postController.updatePost
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post (Admin/Cashier only)
 *     description: |
 *       Permanently deletes a post and its associated thumbnail from Cloudinary.
 *       Only the post author can delete it.
 *       
 *       **Process:**
 *       1. Searches for the post in the database
 *       2. Deletes thumbnail from Cloudinary (if exists)
 *       3. Deletes post from database using transaction
 *       4. If Cloudinary deletion fails, database deletion is rolled back
 *       
 *       **Testing in Swagger UI:**
 *       1. Click "Try it out"
 *       2. Enter the post ID
 *       3. Click "Execute"
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PostResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not authorized to delete this post)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', checkAuth(UserRole.ADMIN, UserRole.CASHIER), postController.deletePost);

export const PostRoutes = router;