import { ApiProperty } from '@nestjs/swagger';

import { IUser } from '../interfaces/user.interface';
import { IFile } from '@modules/firebase/interfaces/file.interface';

export class ResponseUserMapper implements Partial<IUser> {
  @ApiProperty({
    description: 'User id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  public id: number;

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
    description: 'User email',
    example: 'john.doe1@email.com',
    minLength: 3,
    maxLength: 106,
    type: String,
  })
  public email: string;

  @ApiProperty({
    description: 'User avatar',
    example: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public avatar: string | IFile;

  @ApiProperty({
    description: 'User position',
    example: 'Software Engineer',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public position: string;

  @ApiProperty({
    description: 'User location',
    example: 'San Francisco, CA',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public location: string;

  constructor(values: ResponseUserMapper) {
    Object.assign(this, values);
  }

  public static map(user: IUser): ResponseUserMapper {
    return new ResponseUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      position: undefined,
      location: user.location
    });
  }
}
