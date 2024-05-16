import { Injectable } from '@nestjs/common';

import { Bucket }             from '@google-cloud/storage';
import { getStorage }         from 'firebase-admin/storage';
import { GetSignedUrlConfig } from '@google-cloud/storage/build/cjs/src/file';
import { Express }            from 'express';
import { v4 }                 from 'uuid';
import { IFile } from '../interfaces/file.interface';

@Injectable()
export class StorageService {
  private _storage: Bucket;

  async getFiles() {
    if (!this._storage)
      this._storage = getStorage().bucket();

    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 3600 * 1000,
    };

    const files = (await this._storage.getFiles())[0];

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

  // reminder to self: SUBIDA DE ARCHIVOS VER LA OPCIÓN DE HACERLO POR EL FRONT
  // template para subir archivos, no retorna nada, solo sube el archivo.
  async uploadImage(path: string, file: Express.Multer.File) {
    if (!this._storage)
      this._storage = getStorage().bucket();

    const filepath = path + '/' + v4() + '.' + file.originalname.split('.').pop();

    await this._storage.file(filepath).save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      }
    });

    return {filepath};
  }

  async getOneImage(path: string): Promise<IFile> {
    if (!this._storage)
      this._storage = getStorage().bucket();

    const file = this._storage.file(path);
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 3600 * 1000,
    };

    const url = (await file.getSignedUrl(options))[0];

    return {
      name: file.name,
      url,
      contentType: file.metadata.contentType,
      size: file.metadata.size,
      timeCreated: file.metadata.timeCreated,
      updated: file.metadata.updated,
    };
  }
}
