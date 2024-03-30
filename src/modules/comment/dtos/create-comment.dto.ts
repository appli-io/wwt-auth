import { ApiProperty } from '@nestjs/swagger';
import { IsNumber }    from 'class-validator';
import { ContentType } from '@modules/shared/enums/content-type.enum';
import { Enum }        from '@mikro-orm/core';

export class CreateCommentDto {
  @ApiProperty({
    description: 'User id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  @IsNumber()
  public userId: number;

  @ApiProperty({
    description: 'Content type',
    example: 'news',
    type: String,
    enum: ContentType
  })
  @Enum(() => ContentType)
  public contentType: ContentType;

  @ApiProperty({
    description: 'Content id',
    example: '123',
    type: String,
  })
  public contentId: string;
}
