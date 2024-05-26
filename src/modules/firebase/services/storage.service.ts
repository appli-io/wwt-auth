import { Injectable }                 from '@nestjs/common';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { v4 }                         from 'uuid';
import { Bucket }                     from '@google-cloud/storage';
import { ConfigService }              from '@nestjs/config';

@Injectable()
export class StorageService {
  private _storage: Bucket;

  constructor(private readonly _cs: ConfigService) {}

  /**
   * Upload Image to Firebase Storage Bucket
   *
   * @param {string} path - Path to store the image
   * @param {Express.Multer.File} file - File to upload
   * @param {boolean=} useFilename - Optional | Use the original filename, if false, generate by a v4 uuid
   *
   * @returns {Promise<{filepath: string, fileUrl: string}>} filepath and fileUrl
   */
  async uploadImage(
    path: string,
    file: Express.Multer.File,
    useFilename: boolean = false
  ): Promise<{ filepath: string; fileUrl: string; fileName?: string }> {
    if (!this._storage)
      this._storage = getStorage().bucket(this._cs.get('firebase.storage.bucket'));

    const fileName = useFilename ? file.originalname : v4() + '.' + file.originalname.split('.').pop();
    const filepath = path + '/' + fileName;
    const fileRef = this._storage.file(filepath);
    const fileToken = v4();

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        firebaseStorageDownloadTokens: fileToken,
        customMetadata: {
          originalName: file.originalname
        }
      }
    });

    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${ this._cs.get('firebase.storage.bucket') }/o/${ encodeURIComponent(filepath) }?alt=media&token=${ fileToken }`;

    return {filepath, fileUrl, fileName};
  }

  async getDownloadUrl(path: string): Promise<string> {
    if (!this._storage)
      this._storage = getStorage().bucket(this._cs.get('firebase.storage.bucket'));

    const file = this._storage.file(path);

    return await getDownloadURL(file);
  }
}
