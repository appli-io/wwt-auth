import sharp, { ResizeOptions } from 'sharp';

export const generateThumbnail = (buffer: Buffer, resizeOptions?: ResizeOptions) =>
  sharp(buffer).resize(resizeOptions || {width: 250});

export const optimizeImage = async (image: Express.Multer.File, sizeLimitInMb: number = 1): Promise<Express.Multer.File> => {
  const MAX_SIZE = sizeLimitInMb * 1024 * 1024;

  // image is not already webp
  if (image.mimetype !== 'image/webp') {
    const tempBuffer = await sharp(image.buffer).webp({quality: 90}).toBuffer();
    image = {
      ...image,
      buffer: tempBuffer,
      size: tempBuffer.length,
      originalname: `${ image.originalname.split('.').shift() }.webp`,
      mimetype: 'image/webp'
    };
  }

  if (image.size > MAX_SIZE) {
    const tempBuffer = sharp(image.buffer);

    if (image.buffer.length > MAX_SIZE) {
      image.buffer = await tempBuffer.webp({quality: 80}).toBuffer();
      image.originalname = `${ image.originalname.split('.').shift() }.webp`;
      image.mimetype = 'image/webp';
    }
  }

  return image;
};
