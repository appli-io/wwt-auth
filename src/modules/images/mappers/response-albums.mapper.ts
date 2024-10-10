import { AlbumEntity }              from '@modules/images/entities/album.entity';
import { IImage }                   from '@modules/news/interfaces/news.interface';
import { ResponseSimpleUserMapper } from '@modules/users/mappers/response-simple-user.mapper';

export class ResponseAlbumsMapper {
  public id: string;
  public name: string;
  public description: string;
  public cover: IImage;
  public coverThumbnail: IImage;
  public createdBy: ResponseSimpleUserMapper;
  public createdAt: Date;

  public imagesCount: number;

  constructor(values: ResponseAlbumsMapper) {
    Object.assign(this, values);
  }

  static map(album: AlbumEntity): ResponseAlbumsMapper {
    return new ResponseAlbumsMapper({
      id: album.id,
      name: album.name,
      description: album.description,
      cover: album.cover,
      coverThumbnail: album.coverThumbnail,
      createdBy: ResponseSimpleUserMapper.map(album.createdBy),
      createdAt: album.createdAt,
      imagesCount: album['imagesCount']
    });
  }
}
