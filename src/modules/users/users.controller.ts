import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Res,
  UploadedFile,
  UseInterceptors,
}                        from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
}                        from '@nestjs/swagger';

import { FastifyReply } from 'fastify';

import { UpdateUserInfoDto }      from '@modules/users/dtos/update-user-info.dto';
import { ResponseFullUserMapper } from '@modules/users/mappers/response-full-user.mapper';
import { CurrentUser }            from '../auth/decorators/current-user.decorator';
import { Public }                 from '../auth/decorators/public.decorator';
import { IAuthResponseUser }      from '../auth/interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from '../auth/mappers/auth-response-user.mapper';
import { ChangeEmailDto }         from './dtos/change-email.dto';
import { GetUserParams }          from './dtos/get-user.params';
import { PasswordDto }            from './dtos/password.dto';
import { ResponseUserMapper }     from './mappers/response-user.mapper';
import { UsersService }           from './users.service';
import { FileInterceptor }        from '@nest-lab/fastify-multer';
import { StorageService }         from '@modules/firebase/services/storage.service';
import { VALID_IMAGE_TYPES }      from '@common/constant';
import { ContactDto }             from '@modules/users/dtos/contact.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private cookiePath = '/api/auth';
  private cookieName: string;

  constructor(
    private readonly _usersService: UsersService,
    private readonly _configService: ConfigService,
    private readonly _storageService: StorageService,
  ) {
    this.cookieName = this._configService.get<string>('REFRESH_COOKIE');
  }

  @Public()
  @Get()
  @ApiOkResponse({
    type: [ ResponseUserMapper ],
    description: 'The users are found and returned.',
  })
  public async getUsers(): Promise<ResponseUserMapper[]> {
    const users = await this._usersService.findAll();
    return users.map(user => ResponseUserMapper.map(user));
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
  public async getUser(@Param() params: GetUserParams): Promise<ResponseFullUserMapper> {
    const user = await this._usersService.findOneByIdOrUsername(params.idOrUsername);
    return ResponseFullUserMapper.map(user);
  }

  @Patch('/me')
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
    @CurrentUser() id: string,
    @Body() dto: UpdateUserInfoDto,
  ): Promise<ResponseFullUserMapper> {
    const user = await this._usersService.updateUserInfo(id, dto);
    return ResponseFullUserMapper.map(user);
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
    @CurrentUser() id: string,
    @Body() dto: ChangeEmailDto,
  ): Promise<IAuthResponseUser> {
    const user = await this._usersService.updateEmail(id, dto);
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
    @CurrentUser() id: string,
    @Body() dto: PasswordDto,
    @Res() res: FastifyReply,
  ): Promise<void> {
    await this._usersService.delete(id, dto);
    res
      .clearCookie(this.cookieName, {path: this.cookiePath})
      .status(HttpStatus.NO_CONTENT)
      .send();
  }

  @Patch('/contacts')
  public async updateContacts(
    @CurrentUser() userId: string,
    @Body() contacts: ContactDto[]
  ) {
    console.log(contacts);
    const user = await this._usersService.updateContacts(userId, contacts);

    return ResponseFullUserMapper.map(user);
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
  @UseInterceptors(FileInterceptor('avatar', {
    fileFilter: (req, file, cb) => {
      if (!VALID_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('INVALID_IMAGE_TYPE'), false);
      }

      cb(null, true);
    }
  }))
  public async updateAvatar(
    @CurrentUser() id: string,
    @UploadedFile() avatar: Express.Multer.File
  ): Promise<ResponseUserMapper> {
    const user = await this._usersService.updateAvatar(id, avatar);
    return ResponseUserMapper.map(user);
  }
}
