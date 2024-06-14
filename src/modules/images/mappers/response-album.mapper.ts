import { AlbumEntity }              from '@modules/images/entities/album.entity';
import { IImage }                   from '@modules/news/interfaces/news.interface';
import { ResponseSimpleUserMapper } from '@modules/users/mappers/response-simple-user.mapper';
import { ResponseImageMapper }      from '@modules/images/mappers/response-image.mapper';

export class ResponseAlbumMapper {
  public id: string;
  public name: string;
  public description: string;
  public cover: IImage;
  public coverThumbnail: IImage;
  public createdBy: ResponseSimpleUserMapper;
  public createdAt: Date;

  public images: ResponseImageMapper[];

  constructor(values: ResponseAlbumMapper) {
    Object.assign(this, values);
  }

  static map(album: AlbumEntity): ResponseAlbumMapper {
    return new ResponseAlbumMapper({
      id: album.id,
      name: album.name,
      description: album.description,
      cover: album.cover,
      coverThumbnail: album.coverThumbnail,
      createdBy: ResponseSimpleUserMapper.map(album.createdBy),
      createdAt: album.createdAt,
      images: album.images.map(ResponseImageMapper.map)
    });
  }
}
