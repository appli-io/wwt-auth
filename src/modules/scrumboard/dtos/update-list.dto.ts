import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UpdateListDto {
  @IsNumber()
  @Min(0)
  readonly position?: number;

  @IsString()
  @IsNotEmpty()
  readonly title?: string;
}
