import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';

import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityRepository, QBFilterQuery } from '@mikro-orm/core';
import * as path                           from 'node:path';
import { v4 }                              from 'uuid';

import { CommonService }                          from '@common/common.service';
import { generateImageObject, generateThumbnail } from '@common/utils/file.utils';
import { StorageService }                         from '@modules/firebase/services/storage.service';
import { QueryAlbumDto }                          from '@modules/images/dtos/query-album.dto';
import { ImageService }                           from '@modules/images/services/image.service';
import { CreateAlbumDto }                         from '../dtos/create-album.dto';
import { AlbumEntity }                            from '../entities/album.entity';

@Injectable({scope: Scope.REQUEST})
export class AlbumService {
  constructor(
    @InjectRepository(AlbumEntity) private albumRepository: EntityRepository<AlbumEntity>,
    @Inject(forwardRef(() => ImageService)) private readonly _imageService: ImageService,
    private readonly _commonService: CommonService,
    private readonly _storageService: StorageService
  ) {}

  async create(
    createAlbumDto: CreateAlbumDto,
    cover: Express.Multer.File,
    companyId: string,
    userId: string
  ): Promise<AlbumEntity> {
    await this._checkAlbumExists(createAlbumDto.name);

    const albumId: string = v4();
    const basePath: string = `companies/${ companyId }/media/albums/${ albumId }`;
    const album: AlbumEntity = this.albumRepository.create({
      ...createAlbumDto,
      id: albumId,
      company: companyId,
      createdBy: userId,
    });

    if (cover) {
      cover.originalname = 'cover' + path.extname(cover.originalname);
      const {filepath, fileUrl} = await this._storageService.uploadImage(basePath, cover, true);
      album.cover = generateImageObject(cover, filepath, fileUrl);

      // generate thumbnail
      const coverPhotoThumbnail = await generateThumbnail(cover.buffer, {width: 250}).webp().toBuffer();
      const coverThumbnailFile = {
        ...cover,
        buffer: coverPhotoThumbnail,
        originalname: 'cover-thumbnail.webp',
        mimetype: 'image/webp'
      } as Express.Multer.File;
      const {
        filepath: thumbFilepath,
        fileUrl: thumbFileUrl
      } = await this._storageService.uploadImage(basePath, coverThumbnailFile, true);

      album.coverThumbnail = generateImageObject(coverThumbnailFile, thumbFilepath, thumbFileUrl);
    }


    try {
      await this._commonService.saveEntity(album, true);
      return album;
    } catch (error) {
      throw new BadRequestException('Failed to save the album due to a database error');
    }
  }

  async findAll(query: QueryAlbumDto, companyId: string): Promise<AlbumEntity[]> {
    const whereFilter: QBFilterQuery<AlbumEntity> = {company: {id: companyId}};

    Object.keys(query).forEach((key) => {
      if (query[key]) whereFilter[key] = {$eq: query[key]};
    });

    const albumResults = this.albumRepository.findAll({where: whereFilter});

    return Promise.all((await albumResults).map(async album => {
      const imagesCount = await this._imageService.countImagesByAlbumId(album.id);

      return {
        ...album,
        imagesCount
      };
    }));
  }

  async findOne(id: string, companyId: string): Promise<AlbumEntity> {
    const album = await this.albumRepository.findOne({id, company: {id: companyId}});

    if (!album) throw new NotFoundException('ALBUM_NOT_FOUND');

    return album;
  }

  async remove(id: string): Promise<void> {
    const album = await this.albumRepository.findOne({id});

    if (!album) throw new NotFoundException('ALBUM_NOT_FOUND');

    await this._commonService.removeEntity(album);
  }

  private async _checkAlbumExists(name: string): Promise<void> {
    const album = await this.albumRepository.count({name});

    if (album) throw new BadRequestException('ALBUM_ALREADY_EXISTS');
  }
}
