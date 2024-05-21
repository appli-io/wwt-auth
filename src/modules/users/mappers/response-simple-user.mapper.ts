import { ApiProperty } from '@nestjs/swagger';
import { IUser }       from '../interfaces/user.interface';

export class ResponseSimpleUserMapper implements Partial<IUser> {
  @ApiProperty({
    description: 'User id',
    example: 123,
    minimum: 1,
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'User username',
    example: 'john.doe1',
    minLength: 3,
    maxLength: 106,
    type: String,
  })
  public username: string;

  @ApiProperty({
    description: 'User avatar',
    example: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public avatar: string;

  constructor(values: ResponseSimpleUserMapper) {
    Object.assign(this, values);
  }

  public static map(user: IUser): ResponseSimpleUserMapper {
    return new ResponseSimpleUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar
    });
  }
}
