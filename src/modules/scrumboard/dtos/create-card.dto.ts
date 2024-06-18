import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type }                                                       from 'class-transformer';

export class CreateCardDto {
  @IsUUID(4)
  @IsNotEmpty()
  readonly boardId: string;

  @IsUUID(4)
  @IsNotEmpty()
  readonly listId: string;

  @IsNumber()
  readonly position: number;

  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsUUID(4, {each: true})
  @IsOptional()
  readonly labels?: string[];

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  readonly dueDate?: Date;
}
