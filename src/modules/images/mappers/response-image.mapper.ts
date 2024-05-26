import { ImageEntity }              from '@modules/images/entities/image.entity';
import { IImage }                   from '@modules/news/interfaces/news.interface';
import { ResponseSimpleUserMapper } from '@modules/users/mappers/response-simple-user.mapper';

export class ResponseImageMapper {
  public id: string;
  public original: IImage;
  public thumbnail: IImage;
  public uploadedBy: ResponseSimpleUserMapper;
  public createdAt: Date;

  constructor(values: Partial<ResponseImageMapper>) {
    Object.assign(this, values);
  }

  public static map(image: ImageEntity): ResponseImageMapper {
    return new ResponseImageMapper({
      id: image.id,
      original: image.original,
      thumbnail: image.thumbnail,
      uploadedBy: ResponseSimpleUserMapper.map(image.uploadedBy),
      createdAt: image.createdAt,
    });
  }
}
