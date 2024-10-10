import jpegJs from "jpeg-js";
import { PNG as PngEncoder } from "pngjs";

interface EncodeOptions {
  data: Buffer;
  width: number;
  height: number;
  quality?: number;
}

interface PngEncodeOptions {
  data: Buffer;
  width: number;
  height: number;
}

export const JPEG = ({ data, width, height, quality = 0.92 }: EncodeOptions): Buffer => {
  return jpegJs.encode({ data, width, height }, Math.floor(quality * 100)).data;
};

export const PNG = ({ data, width, height }: PngEncodeOptions): Buffer => {
  const png = new PngEncoder({ width, height });
  png.data = data;

  return PngEncoder.sync.write(png, {
    deflateLevel: 9,
    deflateStrategy: 3,
    filterType: -1,
    colorType: 6,
    inputHasAlpha: true
  });
};

export default {
  JPEG,
  PNG
};
