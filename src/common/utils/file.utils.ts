import sharp, { ResizeOptions } from 'sharp';

export const generateThumbnail = (buffer: Buffer, resizeOptions?: ResizeOptions) =>
  sharp(buffer).resize(resizeOptions || {width: 250});
