import { Injectable } from '@nestjs/common';

import { Bucket }             from '@google-cloud/storage';
import { getStorage }         from 'firebase-admin/storage';
import { GetSignedUrlConfig } from '@google-cloud/storage/build/cjs/src/file';

@Injectable()
export class StorageService {
  private _storage: Bucket;

  async getFiles() {
    if (!this._storage) {
      this._storage = getStorage().bucket();
    }

    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 3600 * 1000,
    };

    const files = (await this._storage.getFiles())[0];

    console.log(files);
    return await Promise.all(
      files.map(async file => ({
        name: file.name,
        url: (await file.getSignedUrl(options))[0], // Accede al primer elemento del array
        contentType: file.metadata.contentType,
        size: file.metadata.size,
        timeCreated: file.metadata.timeCreated,
        updated: file.metadata.updated,
      }))
    );
  }
}
