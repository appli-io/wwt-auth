import sharp from 'sharp';

interface Decode {
  (options: { buffer: Buffer }): Promise<Image>;

  all(options: { buffer: Buffer }): Promise<Image[]>;
}

interface Encode {
  [format: string]: (options: { width: number; height: number; data: Uint8Array; quality: number }) => Promise<Buffer>;
}

interface Image {
  width: number;
  height: number;
  data: Uint8Array;

  decode(): Promise<Image>;
}

interface ConvertOptions {
  buffer: Buffer;
  format: string;
  quality?: number;
  all?: boolean;
}

interface ConvertImageOptions {
  image: Image;
  format: string;
  quality?: number;
}

const convertLibrary = (decode: Decode, encode) => {
  const convertImage = async ({image, format, quality}: ConvertImageOptions): Promise<Buffer> => {
    return await encode[format]({
      width: image.width,
      height: image.height,
      data: image.data,
      quality: quality ?? 0.92
    });
  };

  const adjustOrientation = async (buffer: Buffer): Promise<Buffer> => {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    console.log(metadata);

    if (metadata.orientation) {
      return image.rotate().toBuffer();
    }

    return buffer;
  };

  const convert = async ({buffer, format, quality, all}: ConvertOptions): Promise<any> => {
    if (!encode[format]) {
      throw new Error(`output format needs to be one of [${ Object.keys(encode) }]`);
    }

    buffer = await adjustOrientation(buffer);

    if (!all) {
      const image = await decode({buffer});
      return await convertImage({image, format, quality});
    }

    const images = await decode.all({buffer});

    return images.map(image => {
      return {
        convert: async () => await convertImage({
          image: await image.decode(),
          format,
          quality
        })
      };
    });
  };

  return {
    one: async ({buffer, format, quality = 0.92}: ConvertOptions) => await convert({buffer, format, quality, all: false}),
    all: async ({buffer, format, quality = 0.92}: ConvertOptions) => await convert({buffer, format, quality, all: true})
  };
};

export default convertLibrary;
