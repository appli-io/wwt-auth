import { ApiProperty }      from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateRolDto {
  @ApiProperty({
    description: 'The action name',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 100, {
    message: 'Name has to be between 3 and 100 characters.',
  })
  public name!: string;

  @ApiProperty({
    description: 'The action description',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 100, {
    message: 'Description has to be between 3 and 100 characters.',
  })
  public description!: string;
}
