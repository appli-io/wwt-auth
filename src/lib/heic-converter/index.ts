import decode from "heic-decode";
import convertLibrary from "./lib";
import formats from "./formats-node";

const { one, all } = convertLibrary(decode, formats);

interface ConvertOptions {
  buffer: Buffer;
  format: string;
  quality?: number;
}

// Function to convert HEIC to other formats
async function heicToFormat(buffer: Buffer, format: string, quality?: number): Promise<any> {
  console.log(format);
  return await one({ buffer, format, quality });
}

export { heicToFormat };
