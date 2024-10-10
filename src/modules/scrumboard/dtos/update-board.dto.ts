import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @IsString()
  @IsNotEmpty()
  readonly icon?: string;
}
