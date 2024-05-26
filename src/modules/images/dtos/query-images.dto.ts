import { ApiProperty }        from '@nestjs/swagger';
import { v4 }                 from 'uuid';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryImagesDto {

  @ApiProperty({
    description: 'Album Id',
    required: false,
    type: String,
    example: v4(),
  })
  @IsUUID()
  @IsOptional()
  albumId: string;

  @ApiProperty({
    description: 'Company Id',
    required: true,
    type: String,
    example: v4(),
  })
  @IsUUID()
  @IsOptional()
  companyId: string;

  @ApiProperty({
    description: 'User Id',
    required: true,
    type: String,
    example: v4(),
  })
  @IsUUID()
  @IsOptional()
  userId: string;
}
