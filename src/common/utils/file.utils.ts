import sharp, { ResizeOptions } from 'sharp';
import { IImage }               from '@modules/news/interfaces/news.interface';

export const generateThumbnail = (buffer: Buffer, resizeOptions?: ResizeOptions) =>
  sharp(buffer).resize(resizeOptions || {width: 250});

export const generateImageObject = (
  file: Express.Multer.File,
  filepath: string,
  fileUrl: string,
  size?: number
): IImage => ({
  name: file.originalname,
  filepath,
  fileUrl,
  contentType: file.mimetype,
  size: size ?? file.buffer.length,
});
