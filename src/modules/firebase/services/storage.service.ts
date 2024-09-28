import { Injectable }    from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Bucket }                          from '@google-cloud/storage';
import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { getDownloadURL, getStorage }      from 'firebase-admin/storage';
import { v4 }                              from 'uuid';

import { generateThumbnail, optimizeImage } from '@common/utils/file.utils';
import { FileEntity }                       from '@modules/firebase/entities/file.entity';
import { FileType }                         from '@modules/firebase/enums/file-type.enum';
import { UploadOptionsDto }                 from '@modules/firebase/dtos/upload-options.dto';
import { CompanyEntity }                    from '@modules/company/entities/company.entity';

@Injectable()
export class StorageService {
  private _storage: Bucket;

  constructor(
    @InjectRepository(FileEntity) private readonly _fileRepository: EntityRepository<FileEntity>,
    private readonly _em: EntityManager,
    private readonly _cs: ConfigService
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    uploadOptions: UploadOptionsDto,
    companyId?: CompanyEntity['id']
  ) {
    const path = uploadOptions.customPath || (companyId ? `companies/${ companyId }` : '');
    const result = {};
    if (uploadOptions.type === FileType.IMAGE) {
      if (uploadOptions.mustOptimize) file = await optimizeImage(file);

      result['image'] = await this.upload(companyId, uploadOptions.type, path + '/images', file, uploadOptions.useFilename);

      if (uploadOptions.mustThumbnail) {
        const thumbnailBuffer = await generateThumbnail(file.buffer).webp().toBuffer();
        const thumbnailFile: Express.Multer.File = {
          ...file,
          buffer: thumbnailBuffer,
          originalname: `${ v4() }-thumbnail.webp`,
          mimetype: 'image/webp'
        };
        result['thumbnail'] = await this.upload(companyId, uploadOptions.type, path + '/images/thumbnails', thumbnailFile, uploadOptions.useFilename);
      }
    } else {
      result['file'] = await this.upload(companyId, uploadOptions.type, path + '/files', file, uploadOptions.useFilename);
    }

    return result;
  }

  /**
   * Upload Image to Firebase Storage Bucket
   *
   * @param {string} companyId - Company ID
   * @param {FileType} type - Type of file
   * @param {string} path - Path to store the image
   * @param {Express.Multer.File} file - File to upload
   * @param {boolean=} useFilename - Optional | Use the original filename, if false, generate by a v4 uuid
   *
   * @returns {Promise<FileEntity>} filepath, fileUrl and fileName
   */
  async upload(
    companyId: string | undefined,
    type: FileType,
    path: string,
    file: Express.Multer.File,
    useFilename: boolean = false
  ): Promise<FileEntity> {
    if (!this._storage)
      this._storage = getStorage().bucket(this._cs.get('firebase.storage.bucket'));

    const environment = this._cs.get('env');
    const tempId = v4();
    const fileName = useFilename ? file.originalname : tempId + '.' + file.originalname.split('.').pop();
    const filepath = environment + '/' + path + '/' + fileName;
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

    const fileEntity = this._fileRepository.create({
      id: tempId,
      type,
      filepath,
      fileUrl,
      name: file.originalname,
      contentType: file.mimetype,
      size: file.buffer.length,
      company: companyId
    });

    await this._em.persistAndFlush(fileEntity);

    return fileEntity;
  }

  async removeFile(fileEntity: FileEntity): Promise<void> {
    try {
      if (!this._storage)
        this._storage = getStorage().bucket(this._cs.get('firebase.storage.bucket'));

      const file = this._storage.file(fileEntity.filepath);

      if (!file) return;

      await file.delete();
      await this._em.removeAndFlush(fileEntity);
    } catch (error) {
      if (error.code === 404) return;
      if (error.code === 403) throw new Error('Unauthorized to remove file');
      throw new Error('Failed to remove file', error.message);
    }
  }

  async getDownloadUrl(path: string): Promise<string> {
    if (!this._storage)
      this._storage = getStorage().bucket(this._cs.get('firebase.storage.bucket'));

    const file = this._storage.file(path);

    return await getDownloadURL(file);
  }
}
