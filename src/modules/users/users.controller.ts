import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Res, } from '@nestjs/common';
import { ConfigService }                                                 from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
}                                                                        from '@nestjs/swagger';
import { FastifyReply }                                                  from 'fastify';
import { CurrentUser }                                                   from '../auth/decorators/current-user.decorator';
import { Public }                                                        from '../auth/decorators/public.decorator';
import { IAuthResponseUser }                                             from '../auth/interfaces/auth-response-user.interface';
import { AuthResponseUserMapper }                                        from '../auth/mappers/auth-response-user.mapper';
import { ChangeEmailDto }                                                from './dtos/change-email.dto';
import { GetUserParams }                                                 from './dtos/get-user.params';
import { PasswordDto }                                                   from './dtos/password.dto';
import { UpdateUsernameDto }                                             from './dtos/update-username.dto';
import { IResponseUser }                                                 from './interfaces/response-user.interface';
import { ResponseUserMapper }                                            from './mappers/response-user.mapper';
import { UsersService }                                                  from './users.service';
import { UpdateUserInfoDto }                                             from '@modules/users/dtos/update-user-info.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private cookiePath = '/api/auth';
  private cookieName: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
  }

  @Public()
  @Get()
  @ApiOkResponse({
    type: [ ResponseUserMapper ],
    description: 'The users are found and returned.',
  })
  public async getUsers(): Promise<IResponseUser[]> {
    const users = await this.usersService.findAll();
    return users.map(ResponseUserMapper.map);
  }

  @Public()
  @Get('/:idOrUsername')
  @ApiOkResponse({
    type: ResponseUserMapper,
    description: 'The user is found and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'The user is not found.',
  })
  public async getUser(@Param() params: GetUserParams): Promise<IResponseUser> {
    const user = await this.usersService.findOneByIdOrUsername(
      params.idOrUsername,
    );
    return ResponseUserMapper.map(user);
  }

  @Patch('/info')
  @ApiOkResponse({
    type: ResponseUserMapper,
    description: 'The user is updated.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async update(
    @CurrentUser() id: number,
    @Body() dto: UpdateUserInfoDto,
  ): Promise<IResponseUser> {
    const user = await this.usersService.updateUserInfo(id, dto);
    return ResponseUserMapper.map(user);
  }

  @Patch('/username')
  @ApiOkResponse({
    type: ResponseUserMapper,
    description: 'The username is updated.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async updateUsername(
    @CurrentUser() id: number,
    @Body() dto: UpdateUsernameDto,
  ): Promise<IResponseUser> {
    const user = await this.usersService.updateUsername(id, dto);
    return ResponseUserMapper.map(user);
  }

  @Patch('/email')
  @ApiOkResponse({
    type: AuthResponseUserMapper,
    description: 'The email is updated, and the user is returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body, or wrong password.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async updateEmail(
    @CurrentUser() id: number,
    @Body() dto: ChangeEmailDto,
  ): Promise<IAuthResponseUser> {
    const user = await this.usersService.updateEmail(id, dto);
    return AuthResponseUserMapper.map(user);
  }

  @Delete()
  @ApiNoContentResponse({
    description: 'The user is deleted.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body, or wrong password.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async deleteUser(
    @CurrentUser() id: number,
    @Body() dto: PasswordDto,
    @Res() res: FastifyReply,
  ): Promise<void> {
    await this.usersService.delete(id, dto);
    res
      .clearCookie(this.cookieName, {path: this.cookiePath})
      .status(HttpStatus.NO_CONTENT)
      .send();
  }

  @Patch('/avatar')
  @ApiOkResponse({
    type: ResponseUserMapper,
    description: 'The avatar is updated.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async updateAvatar(
    @CurrentUser() id: number,
    @Body() dto: { avatar: string },
  ): Promise<IResponseUser> {
    const user = await this.usersService.updateAvatar(id, dto);
    return ResponseUserMapper.map(user);
  }
}
