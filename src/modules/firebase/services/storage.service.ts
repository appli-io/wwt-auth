import { Injectable } from '@nestjs/common';

import { Bucket, File }               from '@google-cloud/storage';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';

@Injectable()
export class StorageService {
  private _storage: Bucket;

  getFiles() {
    if (!this._storage) {
      this._storage = getStorage().bucket();
    }

    return this._storage.getFiles().then((files) => {
      return files.map((file) => {
        console.log(file);
        return getDownloadURL(file['metadata'] as File);
      });
    });
  }
}
