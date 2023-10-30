import { ApiProperty }                           from '@nestjs/swagger';
import { IsString, Length, Matches, ValidateIf } from 'class-validator';
import { NAME_REGEX, SLUG_REGEX }                from '@common/consts/regex.const';
import { isNull, isUndefined }                   from '@common/utils/validation.util';

export abstract class UpdateUsernameDto {
  @ApiProperty({
    description: 'The new username',
    example: 'new-username',
    type: String,
  })
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  @ValidateIf(
    (o: UpdateUsernameDto) =>
      !isUndefined(o.username) || isUndefined(o.name) || isNull(o.name),
  )
  public username?: string;

  @ApiProperty({
    description: 'The new name',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Name must not have special characters',
  })
  @ValidateIf(
    (o: UpdateUsernameDto) =>
      !isUndefined(o.name) || isUndefined(o.username) || isNull(o.username),
  )
  public name?: string;
}
