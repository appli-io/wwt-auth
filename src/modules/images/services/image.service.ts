import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityRepository, QBFilterQuery } from '@mikro-orm/core';
import * as path                           from 'node:path';
import { v4 }                              from 'uuid';

import { CommonService }     from '@common/common.service';
import { generateThumbnail } from '@common/utils/file.utils';
import { StorageService }    from '@modules/firebase/services/storage.service';
import { QueryImagesDto }    from '@modules/images/dtos/query-images.dto';
import { UserEntity }        from '@modules/users/entities/user.entity';
import { IImage }            from '@modules/news/interfaces/news.interface';
import { ImageEntity }       from '../entities/image.entity';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity) private readonly _imageRepository: EntityRepository<ImageEntity>,
    private readonly _commonService: CommonService,
    private readonly _storageService: StorageService
  ) {}

  async create(
    albumId: string,
    images: Express.Multer.File[],
    companyId: string,
    userId: string
  ): Promise<ImageEntity[]> {
    const basePath = `companies/${ companyId }/media/albums/${ albumId }`;

    const uploadPromises = images.map(async (file) => {
      const image = this._imageRepository.create({
        id: v4(),
        album: albumId,
        company: companyId,
        uploadedBy: userId,
      });

      image.uploadedBy = {id: userId} as UserEntity;

      // Original image
      file.originalname = image.id + path.extname(file.originalname);

      const {filepath, fileUrl} = await this._storageService.uploadImage(basePath, file, true);

      image.original = this.createImageObject(file, filepath, fileUrl);

      // Thumbnail;
      const thumbnailBuffer = await generateThumbnail(file.buffer).webp().toBuffer();
      const thumbnailFile: Express.Multer.File = {
        ...file,
        buffer: thumbnailBuffer,
        originalname: `${ image.id }-thumbnail.webp`,
        mimetype: 'image/webp'
      };
      const {
        filepath: thumbnailFilepath,
        fileUrl: thumbnailUrl
      } = await this._storageService.uploadImage(`${ basePath }/thumbnails`, thumbnailFile, true);

      image.thumbnail = this.createImageObject(thumbnailFile, thumbnailFilepath, thumbnailUrl);
      image.size = file.buffer.length + thumbnailBuffer.length;

      try {
        await this._commonService.saveEntity(image, true, false); // Don't flush yet
        return image;
      } catch (error) {
        throw new BadRequestException('Error saving the image');
      }
    });

    const imageEntities = await Promise.all(uploadPromises);
    await this._commonService.flush();

    return imageEntities;
  }

  async findAll(query: QueryImagesDto, companyId: string): Promise<ImageEntity[]> {
    const whereFilter: QBFilterQuery<ImageEntity> = {};

    if (query.albumId) whereFilter.album = {id: query.albumId};
    whereFilter.company = {id: companyId};

    return this._imageRepository.findAll({where: whereFilter});
  }

  async findOne(id: string): Promise<ImageEntity> {
    return this._imageRepository.findOneOrFail({id});
  }

  async remove(id: string): Promise<void> {
    const image = await this._imageRepository.findOneOrFail({id});
    await this._commonService.removeEntity(image);
  }

  private createImageObject(file: Express.Multer.File, filepath: string, fileUrl: string, size?: number): IImage {
    return {
      name: file.originalname,
      filepath,
      fileUrl,
      contentType: file.mimetype,
      size: size ?? file.buffer.length,
    };
  }
}
