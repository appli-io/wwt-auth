import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { FileType }                                from '@modules/firebase/enums/file-type.enum';
import { Transform }                               from 'class-transformer';

export class UploadOptionsDto {
  @IsEnum(FileType)
  @Transform(({value}) => FileType[value])
  public type: FileType;

  @IsString()
  @IsOptional()
  public filename?: string;

  @IsBoolean()
  public isCompanyFile: boolean;

  @IsBoolean()
  public mustCompress: boolean;

  @IsBoolean()
  public mustThumbnail: boolean;
}
