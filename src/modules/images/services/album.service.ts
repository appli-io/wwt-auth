import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';

import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityRepository, QBFilterQuery } from '@mikro-orm/core';
import * as path                           from 'node:path';
import { v4 }                              from 'uuid';

import { CommonService }                    from '@common/common.service';
import { generateThumbnail, optimizeImage } from '@common/utils/file.utils';
import { StorageService }                   from '@modules/firebase/services/storage.service';
import { QueryAlbumDto }                    from '@modules/images/dtos/query-album.dto';
import { ImageService }                     from '@modules/images/services/image.service';
import { FileType }                         from '@modules/firebase/enums/file-type.enum';
import { CreateAlbumDto }                   from '../dtos/create-album.dto';
import { AlbumEntity }                      from '../entities/album.entity';
import { updateOnlyChangedFields }          from '@common/utils/functions.util';

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
    await this._checkAlbumExists(createAlbumDto.name, companyId);

    const albumId: string = v4();
    const basePath: string = `companies/${ companyId }/media/albums/${ albumId }`;
    const album: AlbumEntity = this.albumRepository.create({
      ...createAlbumDto,
      id: albumId,
      company: companyId,
      createdBy: userId,
    });

    if (cover) {
      const {coverEntity, thumbnailEntity} = await this._uploadCover(cover, companyId, albumId);

      album.cover = coverEntity;
      album.coverThumbnail = thumbnailEntity;
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

    const albumResults = this.albumRepository.findAll({
      where: whereFilter,
      orderBy: {createdAt: 'DESC'},
      populate: [ 'createdBy', 'cover', 'coverThumbnail' ]
    });

    return Promise.all((await albumResults).map(async album => {
      const imagesCount = await this._imageService.countImagesByAlbumId(album.id);

      return {
        ...album,
        imagesCount
      };
    }));
  }

  async findOne(id: string, companyId: string): Promise<AlbumEntity> {
    const album = await this.albumRepository.findOne({
      id,
      company: {id: companyId}
    }, {
      populate: [ 'createdBy', 'images', 'cover', 'coverThumbnail' ],
      orderBy: {images: {createdAt: 'DESC'}}
    });

    if (!album) throw new NotFoundException('ALBUM_NOT_FOUND');

    return album;
  }

  async update(id: string, updateAlbumDto: CreateAlbumDto, cover: Express.Multer.File, companyId: string): Promise<AlbumEntity> {
    const album = await this.albumRepository.findOne({id, company: {id: companyId}});

    if (!album) throw new NotFoundException('ALBUM_NOT_FOUND');

    if (updateAlbumDto.name !== album.name)
      await this._checkAlbumExists(updateAlbumDto.name, companyId);

    updateOnlyChangedFields(album, updateAlbumDto, [ 'cover' ]);

    if (cover) {
      // remove old cover
      if (album.cover) {
        await this._storageService.removeFile(album.cover.filepath);
        await this._storageService.removeFile(album.coverThumbnail.filepath);
      }

      const {coverEntity, thumbnailEntity} = await this._uploadCover(cover, companyId, id);

      album.cover = coverEntity;
      album.coverThumbnail = thumbnailEntity;
    }

    try {
      await this._commonService.saveEntity(album, true);
      return album;
    } catch (error) {
      throw new BadRequestException('Failed to update the album due to a database error');
    }
  }

  async remove(id: string): Promise<void> {
    const album = await this.albumRepository.findOne({id}, {populate: [ 'images' ]});

    if (!album) throw new NotFoundException('ALBUM_NOT_FOUND');

    // Start all delete operations at once
    const deletePromises = album.images.map(image => this._imageService.removeFromEntity(image));
    if (album.cover) {
      deletePromises.push(this._storageService.removeFile(album.cover.filepath));
      deletePromises.push(this._storageService.removeFile(album.coverThumbnail.filepath));
    }

    // Wait for all delete operations to complete
    await Promise.all(deletePromises);

    await this._commonService.removeEntity(album);
  }

  private async _checkAlbumExists(name: string, companyId: string): Promise<void> {
    const album = await this.albumRepository.count({name, company: {id: companyId}});

    if (album) throw new BadRequestException('ALBUM_ALREADY_EXISTS');
  }

  private async _uploadCover(cover: Express.Multer.File, companyId: string, id: string) {
    const basePath: string = `companies/${ companyId }/media/albums/${ id }`;
    cover = await optimizeImage(cover);
    cover.originalname = 'cover' + path.extname(cover.originalname);
    const coverEntity = await this._storageService.uploadImage(companyId, FileType.IMAGE, basePath, cover, true);

    // generate thumbnail
    const coverPhotoThumbnail = await generateThumbnail(cover.buffer, {width: 500}).webp().toBuffer();
    const coverThumbnailFile = {
      ...cover,
      buffer: coverPhotoThumbnail,
      originalname: 'cover-thumbnail.webp',
      mimetype: 'image/webp'
    } as Express.Multer.File;

    const thumbnailEntity = await this._storageService.uploadImage(companyId, FileType.IMAGE, basePath, coverThumbnailFile, true);

    return {coverEntity, thumbnailEntity};
  }
}
