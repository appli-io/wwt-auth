import { Injectable }                 from '@nestjs/common';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { v4 }                         from 'uuid';

@Injectable()
export class StorageService {
  private _storage: any;

  async uploadImage(path: string, file: Express.Multer.File, filename?: string) {
    if (!this._storage)
      this._storage = getStorage().bucket();

    const filepath = path + '/' + (filename || v4()) + '.' + file.originalname.split('.').pop();

    await this._storage.file(filepath).save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      }
    });

    return {filepath};
  }

  async getSignedUrl(path: string): Promise<string> {
    console.log(path);
    if (!this._storage)
      this._storage = getStorage().bucket();

    const file = this._storage.file(path);

    return await getDownloadURL(file);
  }
}
