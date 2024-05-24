import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import sharp                from 'sharp';

import { CommonService }  from '@common/common.service';
import { StorageService } from '@modules/firebase/services/storage.service';
import { UserEntity }     from '@modules/users/entities/user.entity';
import { IImage }         from '@modules/news/interfaces/news.interface';
import { ImageEntity }    from './entities/image.entity';
import { CreateImageDto } from './dtos/create-image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity) private readonly _imageRepository: EntityRepository<ImageEntity>,
    private readonly _commonService: CommonService,
    private readonly _storageService: StorageService
  ) {}

  async create(
    createImageDto: CreateImageDto,
    files: Express.Multer.File[],
    companyId: string,
    userId: string
  ): Promise<ImageEntity[]> {
    const basePath = `companies/${ companyId }/images/${ createImageDto.albumId }`;

    const uploadPromises = files.map(async (file) => {
      const image = new ImageEntity();
      image.uploadedBy = {id: userId} as UserEntity;

      const {filepath, fileUrl} = await this._storageService.uploadImage(basePath, file);

      image.original = this.createImageObject(file, filepath, fileUrl);

      const thumbnailPath = `${ basePath }/thumbnails`;
      const thumbnailBuffer = await this.generateThumbnail(file.buffer);
      const {fileUrl: thumbnailUrl, filepath: thumbnailFilepath} = await this._storageService.uploadImage(thumbnailPath, {
        ...file,
        buffer: thumbnailBuffer
      });
      image.thumbnail = this.createImageObject(file, thumbnailFilepath, thumbnailUrl, thumbnailBuffer.length);

      image.size = file.buffer.length + thumbnailBuffer.length;

      try {
        await this._commonService.saveEntity(image, true, false); // Don't flush yet
        return image;
      } catch (error) {
        throw new BadRequestException('Error saving the image');
      }
    });

    const images = await Promise.all(uploadPromises);
    await this._commonService.flush();

    return images;
  }

  async findAll(): Promise<ImageEntity[]> {
    return this._imageRepository.findAll();
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

  private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).resize(200, 200).toBuffer();
  }
}
