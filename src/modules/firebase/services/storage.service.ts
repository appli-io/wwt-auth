import { Injectable }                      from '@nestjs/common';
import { getDownloadURL, getStorage }      from 'firebase-admin/storage';
import { v4 }                              from 'uuid';
import { Bucket }                          from '@google-cloud/storage';
import { ConfigService }                   from '@nestjs/config';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { FileEntity }                      from '@modules/firebase/entities/file.entity';
import { InjectRepository }                from '@mikro-orm/nestjs';
import { FileType }                        from '@modules/firebase/enums/file-type.enum';

@Injectable()
export class StorageService {
  private _storage: Bucket;

  constructor(
    @InjectRepository(FileEntity) private readonly _fileRepository: EntityRepository<FileEntity>,
    private readonly _em: EntityManager,
    private readonly _cs: ConfigService
  ) {}

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
  async uploadImage(
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

  async removeFile(path: string): Promise<void> {
    if (!this._storage)
      this._storage = getStorage().bucket(this._cs.get('firebase.storage.bucket'));

    const file = this._storage.file(path);

    await file.delete();
  }

  async getDownloadUrl(path: string): Promise<string> {
    if (!this._storage)
      this._storage = getStorage().bucket(this._cs.get('firebase.storage.bucket'));

    const file = this._storage.file(path);

    return await getDownloadURL(file);
  }
}
