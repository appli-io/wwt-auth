import { Injectable }                 from '@nestjs/common';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { v4 }                         from 'uuid';
import { LogMethodExecutionTime }     from '@common/decorators/log-method-execution-time.decorator';

@Injectable()
export class StorageService {
  private _storage: any;

  async uploadImage(path: string, file: Express.Multer.File, filename?: string) {
    if (!this._storage)
      this._storage = getStorage().bucket();

    const filepath = path + '/' + (filename || v4()) + '.' + file.originalname.split('.').pop();

    const fileRef = this._storage.file(filepath);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        customMetadata: {
          originalName: file.originalname
        }
      }
    });

    const fileUrl = await getDownloadURL(fileRef);

    return {filepath, fileUrl};
  }

  @LogMethodExecutionTime()
  async getSignedUrl(path: string): Promise<string> {
    if (!this._storage)
      this._storage = getStorage().bucket();

    const file = this._storage.file(path);

    return await getDownloadURL(file);
  }
}
