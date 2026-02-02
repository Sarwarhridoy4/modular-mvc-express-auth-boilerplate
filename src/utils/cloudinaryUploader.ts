import cloudinary from '../config/cloudinary.config';

export const uploadToCloudinary = async (
  file: Buffer,
  folder: string = 'uploads'
) => {
  try {
    const base64File = `data:${'application/octet-stream'};base64,${file.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64File, {
      folder: folder,
      resource_type: 'auto', // Automatically detect file type (image, video, raw)
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary.');
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('Failed to delete file from Cloudinary.');
  }
};
