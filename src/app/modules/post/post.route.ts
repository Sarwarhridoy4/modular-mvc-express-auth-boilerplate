import { Router } from 'express';
import { checkAuth } from '../../middleware/CheckAuth.js';
import { UserRole } from '@prisma/client';
import { upload } from '../../../config/multer.config.js';
import { postController } from './post.controller.js';

const router = Router();

router.post(
  '/',
  checkAuth(UserRole.ADMIN),
  upload.single('thumbnail'),
  postController.createPost
);

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getSinglePost);

router.patch(
  '/:id',
  checkAuth(UserRole.ADMIN),
  upload.single('thumbnail'),
  postController.updatePost
);

router.delete('/:id', checkAuth(UserRole.ADMIN), postController.deletePost);

export const PostRoutes = router;
