-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "thumbnailPublicId" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePicPublicId" TEXT,
ADD COLUMN     "profilePicUrl" TEXT;
