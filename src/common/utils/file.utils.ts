import sharp, { ResizeOptions } from 'sharp';

export const generateThumbnail = (buffer: Buffer, resizeOptions?: ResizeOptions) =>
  sharp(buffer).resize(resizeOptions || {width: 250});

export const optimizeImage = async (image: Express.Multer.File, sizeLimitInMb: number = 1): Promise<Express.Multer.File> => {
  const MAX_SIZE = sizeLimitInMb * 1024 * 1024;
  const MAX_DIMENSION = 1024;

  if (image.size > MAX_SIZE) {
    let tempBuffer = sharp(image.buffer);
    const metadata = await tempBuffer.metadata();

    if (metadata.width > metadata.height) {
      if (metadata.width > MAX_DIMENSION) tempBuffer = tempBuffer.resize({width: MAX_DIMENSION, fit: 'inside'});
    } else {
      if (metadata.height > MAX_DIMENSION) tempBuffer = tempBuffer.resize({height: MAX_DIMENSION, fit: 'inside'});
    }

    // if it is greater any dimension, assume that was resized and update the buffer
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION)
      image.buffer = await tempBuffer.toBuffer();

    if (image.buffer.length > MAX_SIZE) {
      image.buffer = await tempBuffer.webp({quality: 80}).toBuffer();
      image.originalname = 'cover.webp';
      image.mimetype = 'image/webp';
    }
  }

  return image;
};
