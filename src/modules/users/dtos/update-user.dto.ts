import { isUndefined } from '@nestjs/common/utils/shared.utils';

import { IsString, Length, Matches, ValidateIf } from 'class-validator';

import { NAME_REGEX, SLUG_REGEX } from '@common/consts/regex.const';
import { isNull }                 from '@common/utils/validation.util';

export abstract class UpdateUserDto {
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  @ValidateIf(
    ( o: UpdateUserDto ) =>
      !isUndefined(o.username) || isUndefined(o.name) || isNull(o.name),
  )
  public username?: string;

  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Name must not have special characters',
  })
  @ValidateIf(
    ( o: UpdateUserDto ) =>
      !isUndefined(o.name) || isUndefined(o.username) || isNull(o.username),
  )
  public name?: string;
}