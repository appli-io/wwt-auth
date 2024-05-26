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
import { CreateImageDto }    from '../dtos/create-image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity) private readonly _imageRepository: EntityRepository<ImageEntity>,
    private readonly _commonService: CommonService,
    private readonly _storageService: StorageService
  ) {}

  async create(
    createImageDto: CreateImageDto,
    images: Express.Multer.File[],
    companyId: string,
    userId: string
  ): Promise<ImageEntity[]> {
    const basePath = `companies/${ companyId }/media/albums/${ createImageDto.albumId }`;

    const uploadPromises = images.map(async (file) => {
      const image = this._imageRepository.create({
        id: v4(),
        album: createImageDto.albumId,
        uploadedBy: userId,
      });

      image.uploadedBy = {id: userId} as UserEntity;
      file.originalname = image.id + path.extname(file.originalname);

      const {filepath, fileUrl} = await this._storageService.uploadImage(basePath, file, true);

      image.original = this.createImageObject(file, filepath, fileUrl);

      const thumbnailPath = `${ basePath }/thumbnails`;
      const thumbnailBuffer = await generateThumbnail(file.buffer).toBuffer();
      const {fileUrl: thumbnailUrl, filepath: thumbnailFilepath} = await this._storageService.uploadImage(thumbnailPath, {
        ...file,
        buffer: thumbnailBuffer,
        originalname: `${ image.id }-thumbnail.webp`,
      }, true);

      image.thumbnail = this.createImageObject(file, thumbnailFilepath, thumbnailUrl, thumbnailBuffer.length);
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

    Object.keys(query).forEach(key => {
      if (query[key]) {
        whereFilter[key] = {$eq: query[key]};
      }
    });

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
