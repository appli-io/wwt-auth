import { BadRequestException, Injectable, Scope } from '@nestjs/common';

import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityRepository, QBFilterQuery } from '@mikro-orm/core';
import * as path                           from 'node:path';
import { v4 }                              from 'uuid';

import { CommonService }     from '@common/common.service';
import { generateThumbnail } from '@common/utils/file.utils';
import { StorageService }    from '@modules/firebase/services/storage.service';
import { QueryImagesDto }    from '@modules/images/dtos/query-images.dto';
import { ImageEntity }       from '../entities/image.entity';
import { FileType }          from '@modules/firebase/enums/file-type.enum';

@Injectable({scope: Scope.REQUEST})
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
      const id = v4();

      // Original image
      file.originalname = id + path.extname(file.originalname);

      const {id: originalId} = await this._storageService.uploadImage(companyId, FileType.IMAGE, basePath, file, true);

      // Thumbnail;
      const thumbnailBuffer = await generateThumbnail(file.buffer).webp().toBuffer();
      const thumbnailFile: Express.Multer.File = {
        ...file,
        buffer: thumbnailBuffer,
        originalname: `${ id }-thumbnail.webp`,
        mimetype: 'image/webp'
      };
      const {id: thumbnailId} = await this._storageService.uploadImage(companyId, FileType.IMAGE, `${ basePath }/thumbnails`, thumbnailFile, true);

      const image = this._imageRepository.create({
        id: id,
        original: originalId,
        thumbnail: thumbnailId,
        album: albumId,
        company: companyId,
        uploadedBy: userId,
        size: file.buffer.length + thumbnailBuffer.length
      });

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

    return this._imageRepository.findAll({where: whereFilter, populate: [ 'original', 'thumbnail' ]});
  }

  async findOne(id: string): Promise<ImageEntity> {
    return this._imageRepository.findOneOrFail({id}, {populate: [ 'original', 'thumbnail' ]});
  }

  async remove(id: string): Promise<void> {
    const image = await this._imageRepository.findOneOrFail({id});
    await this._commonService.removeEntity(image);
  }

  async countImagesByAlbumId(albumId: string): Promise<number> {
    return this._imageRepository.count({album: {id: albumId}});
  }
}
