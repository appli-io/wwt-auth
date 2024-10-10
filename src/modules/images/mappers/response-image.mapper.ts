import { ImageEntity }              from '@modules/images/entities/image.entity';
import { ResponseSimpleUserMapper } from '@modules/users/mappers/response-simple-user.mapper';
import { ResponseFileMapper }       from '@modules/firebase/mappers/response-file.mapper';

export class ResponseImageMapper {
  public id: string;
  public original: ResponseFileMapper;
  public thumbnail: ResponseFileMapper;
  public size: number;
  public uploadedBy: ResponseSimpleUserMapper;
  public createdAt: Date;

  constructor(values: Partial<ResponseImageMapper>) {
    Object.assign(this, values);
  }

  public static map(image: ImageEntity): ResponseImageMapper {
    return new ResponseImageMapper({
      id: image.id,
      original: ResponseFileMapper.map(image.original),
      thumbnail: ResponseFileMapper.map(image.thumbnail),
      size: image.size,
      uploadedBy: ResponseSimpleUserMapper.map(image.uploadedBy),
      createdAt: image.createdAt,
    });
  }
}
