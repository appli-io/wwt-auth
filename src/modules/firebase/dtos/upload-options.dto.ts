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

  @IsString()
  @IsOptional()
  public customPath?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({value}) => value === undefined ? false : value)
  public mustOptimize?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({value}) => value === undefined ? false : value)
  public mustThumbnail?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({value}) => value === undefined ? false : value)
  public useFilename?: boolean;
}
