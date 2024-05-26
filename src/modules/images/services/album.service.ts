import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityRepository, QBFilterQuery } from '@mikro-orm/core';
import { v4 }                              from 'uuid';

import { CommonService }                          from '@common/common.service';
import { generateImageObject, generateThumbnail } from '@common/utils/file.utils';
import { StorageService }                         from '@modules/firebase/services/storage.service';
import { CreateAlbumDto }                         from '../dtos/create-album.dto';
import { AlbumEntity }                            from '../entities/album.entity';
import { QueryAlbumDto }                          from '@modules/images/dtos/query-album.dto';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(AlbumEntity) private albumRepository: EntityRepository<AlbumEntity>,
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

    const albumId = v4();
    const basePath = `companies/${ companyId }/media/albums/${ albumId }`;
    const album = this.albumRepository.create({
      ...createAlbumDto,
      id: albumId,
      company: companyId,
      createdBy: userId,
    });

    if (cover) {
      const {filepath, fileUrl} = await this._storageService.uploadImage(basePath, cover, 'cover');
      album.cover = generateImageObject({...cover, originalname: 'cover.webp'}, filepath, fileUrl);

      // generate thumbnail
      const coverPhotoThumbnail = await generateThumbnail(cover.buffer, {width: 250}).webp().toBuffer();
      const coverThumbnailFile = {
        ...cover,
        buffer: coverPhotoThumbnail,
        originalname: 'cover-thumbnail.webp',
        mimetype: 'image/webp'
      };
      const {
        filepath: thumbFilepath,
        fileUrl: thumbFileUrl
      } = await this._storageService.uploadImage(basePath, coverThumbnailFile);

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

    return this.albumRepository.findAll({where: whereFilter});
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
