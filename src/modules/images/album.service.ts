import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityRepository }                from '@mikro-orm/core';
import { AlbumEntity }                     from './entities/album.entity';
import { CreateAlbumDto }                  from './dtos/create-album.dto';
import { CommonService }                   from '@common/common.service';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(AlbumEntity) private albumRepository: EntityRepository<AlbumEntity>,
    private readonly _commonService: CommonService,
  ) {}

  async create(createAlbumDto: CreateAlbumDto): Promise<AlbumEntity> {
    const album = this.albumRepository.create(createAlbumDto);
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
}
