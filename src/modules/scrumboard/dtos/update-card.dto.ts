import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type }                                                       from 'class-transformer';

export class UpdateCardDto {
  @IsNumber()
  @IsOptional()
  readonly position?: number;

  @IsUUID(4)
  @IsOptional()
  readonly listId?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly description?: string;

  @IsUUID(4, {each: true})
  @IsOptional()
  readonly labels?: string[];

  @IsUUID(4, {each: true})
  @IsOptional()
  readonly assignees?: string[];

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  readonly dueDate?: Date;
}
