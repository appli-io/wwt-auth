import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateListDto {
  @IsUUID(4)
  @IsNotEmpty()
  readonly boardId: string;

  @IsNumber()
  @Min(0)
  readonly position: number;

  @IsString()
  @IsNotEmpty()
  readonly title: string;
}
