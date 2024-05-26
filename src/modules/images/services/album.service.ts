import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

import { CommonService }                          from '@common/common.service';
import { generateImageObject, generateThumbnail } from '@common/utils/file.utils';
import { StorageService }                         from '@modules/firebase/services/storage.service';
import { CreateAlbumDto }                         from '../dtos/create-album.dto';
import { AlbumEntity }                            from '../entities/album.entity';
import { v4 }                                     from 'uuid';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(AlbumEntity) private albumRepository: EntityRepository<AlbumEntity>,
    private readonly _commonService: CommonService,
    private readonly _storageService: StorageService
  ) {}

  async create(
    createAlbumDto: CreateAlbumDto,
    coverPhoto: Express.Multer.File,
    companyId: string,
    userId: string
  ): Promise<AlbumEntity> {
    await this._checkAlbumExists(createAlbumDto.name);

    const albumId = v4();
    const basePath = `companies/${ companyId }/media/albums/${ albumId }`;
    const coverPhotoThumbnail = await generateThumbnail(coverPhoto.buffer, {width: 250}).webp().toBuffer();
    const {filepath, fileUrl} = await this._storageService.uploadImage(basePath, {
      ...coverPhoto,
      buffer: coverPhotoThumbnail,
      originalname: 'cover.webp',
      mimetype: 'image/webp'
    }, 'cover');

    const album = this.albumRepository.create({
      ...createAlbumDto,
      id: albumId,
      coverImage: generateImageObject(coverPhoto, filepath, fileUrl),
      company: {id: companyId},
      createdBy: {id: userId},
    });
    try {
      await this._commonService.saveEntity(album, true);
      return album;
    } catch (error) {
      throw new BadRequestException('Failed to save the album due to a database error');
    }
  }

  async findAll(): Promise<AlbumEntity[]> {
    return this.albumRepository.findAll();
  }

  async findOne(id: string): Promise<AlbumEntity> {
    return this.albumRepository.findOneOrFail({id});
  }

  async remove(id: string): Promise<void> {
    const album = await this.albumRepository.findOneOrFail({id});
    await this._commonService.removeEntity(album);
  }

  private async _checkAlbumExists(name: string): Promise<void> {
    const album = await this.albumRepository.count({name});

    if (album) throw new BadRequestException('ALBUM_ALREADY_EXISTS');
  }
}
