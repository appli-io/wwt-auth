import { IImage }     from '@modules/news/interfaces/news.interface';
import { FileEntity } from '@modules/firebase/entities/file.entity';

export class ResponseFileMapper implements IImage {
  public id: string;
  public name: string;
  public filepath: string;
  public fileUrl: string;
  public contentType: string;
  public size: number;

  constructor(values: Partial<ResponseFileMapper>) {
    Object.assign(this, values);
  }

  static map(file: FileEntity): ResponseFileMapper {
    return new ResponseFileMapper({
      id: file.id,
      name: file.name,
      filepath: file.filepath,
      fileUrl: file.fileUrl,
      contentType: file.contentType,
      size: file.size,
    });
  }
}
