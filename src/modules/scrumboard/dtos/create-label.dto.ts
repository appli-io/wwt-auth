import { Transform }            from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => value.trim())
  readonly title: string;

  // @IsString()
  // @Transform(({value}) => value.trim())
  // readonly color: string;
}
