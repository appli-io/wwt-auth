import { IsNotEmpty, IsString } from 'class-validator';
import { Transform }            from 'class-transformer';

export class CreateBoardDto {

  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => value.trim())
  readonly title: string;

  @IsString()
  @Transform(({value}) => value.trim())
  readonly description?: string;

  @IsString()
  @Transform(({value}) => value.trim())
  readonly icon?: string;
}
