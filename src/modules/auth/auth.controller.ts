import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { ConfigService }                                                                                         from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
}                                                                                                                from '@nestjs/swagger';
import { FastifyReply, FastifyRequest }                                                                          from 'fastify';

import AES      from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

import { isNull, isUndefined } from '@common/utils/validation.util';
import { IMessage }            from '@common/interfaces/message.interface';
import { MessageMapper }       from '@common/mappers/message.mapper';

import { UsersService }                 from '../users/users.service';
import { AuthService }                  from './auth.service';
import { CurrentUser }                  from './decorators/current-user.decorator';
import { Origin }                       from './decorators/origin.decorator';
import { Public }                       from './decorators/public.decorator';
import { ChangePasswordDto }            from './dtos/change-password.dto';
import { ConfirmEmailDto }              from './dtos/confirm-email.dto';
import { EmailDto }                     from './dtos/email.dto';
import { ResetPasswordDto }             from './dtos/reset-password.dto';
import { SignInDto }                    from './dtos/sign-in.dto';
import { SignUpDto }                    from './dtos/sign-up.dto';
import { FastifyThrottlerGuard }        from './guards/fastify-throttler.guard';
import { IAuthResponseUser }            from './interfaces/auth-response-user.interface';
import { IOAuthProvidersResponse }      from './interfaces/oauth-provider-response.interface';
import { AuthResponseUserMapper }       from './mappers/auth-response-user.mapper';
import { AuthResponseMapper }           from './mappers/auth-response.mapper';
import { OAuthProvidersResponseMapper } from './mappers/oauth-provider-response.mapper';
import { ResponsePositionsMapper }      from '@modules/auth/mappers/response-positions.mapper';
import { StorageService }               from '@modules/firebase/services/storage.service';
import { IConfig }                      from '@config/interfaces/config.interface';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(FastifyThrottlerGuard)
export class AuthController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly cryptoKey: string;
  private readonly testing: boolean;

  constructor(
    private readonly _authService: AuthService,
    private readonly _usersService: UsersService,
    private readonly _storageService: StorageService,
    private readonly _configService: ConfigService<IConfig>,
  ) {
    this.cookieName = this._configService.get<string>('REFRESH_COOKIE', {infer: true});
    this.refreshTime = this._configService.get<number>('jwt.refresh.time', {infer: true});
    this.cryptoKey = this._configService.get('crypto.key', {infer: true});
    this.testing = this._configService.get<boolean>('testing');
  }

  @Public()
  @Post('/sign-up')
  @ApiCreatedResponse({
    type: MessageMapper,
    description: 'The user has been created and is waiting confirmation',
  })
  @ApiConflictResponse({
    description: 'Email already in use',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  public async signUp(
    @Origin() origin: string | undefined,
    @Body() signUpDto: SignUpDto,
  ): Promise<IMessage> {
    return await this._authService.signUp(signUpDto, origin);
  }

  @Public()
  @Post('/sign-up/validate-email')
  @ApiOkResponse({
    type: MessageMapper,
    description: 'Validates the user email existence',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  public async validateSignUpEmail(
    @Body('email') encryptedEmail: string,
  ): Promise<{ isValid: boolean }> {
    console.log(this.cryptoKey);
    // decrypt AES encrypted email
    const email = AES.decrypt(encryptedEmail, this.cryptoKey).toString(CryptoJS.enc.Utf8);
    const user = await this._usersService.findOneByEmail(email);

    if (user) return {isValid: false};

    return {isValid: true};
  }

  @Public()
  @Post('/sign-in')
  @ApiOkResponse({
    type: AuthResponseMapper,
    description: 'Logs in the user and returns the access token',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or User is not confirmed',
  })
  public async signIn(
    @Res() res: FastifyReply,
    @Origin() origin: string | undefined,
    @Body() singInDto: SignInDto,
  ): Promise<void> {
    const result = await this._authService.signIn(singInDto, origin);
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .send(AuthResponseMapper.map(result));
  }

  @Public()
  @Post('/refresh-access')
  @ApiOkResponse({
    type: AuthResponseMapper,
    description: 'Refreshes and returns the access token',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
  })
  @ApiBadRequestResponse({
    description:
      'Something is invalid on the request body, or Token is invalid or expired',
  })
  public async refreshAccess(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ): Promise<void> {
    try {
      const token = this.refreshTokenFromReq(req);
      const result = await this._authService.refreshTokenAccess(
        token,
        req.headers.host,
      );
      this.saveRefreshCookie(res, result.refreshToken)
        .status(HttpStatus.OK)
        .send(AuthResponseMapper.map(result));
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        res
          .clearCookie(this.cookieName, {path: this.cookiePath})
          .header('Content-Type', 'application/json')
          .status(HttpStatus.UNAUTHORIZED)
          .send(new MessageMapper('Invalid token'));
      }
    }
  }

  @Post('/sign-out')
  @ApiOkResponse({
    type: MessageMapper,
    description: 'The user is logged out',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
  })
  public async signOut(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const message = await this._authService.logout(token);
    res
      .clearCookie(this.cookieName, {path: this.cookiePath})
      .header('Content-Type', 'application/json')
      .status(HttpStatus.OK)
      .send(message);
  }

  @Public()
  @Post('/confirm-email')
  @ApiOkResponse({
    type: AuthResponseMapper,
    description: 'Confirms the user email and returns the access token',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
  })
  @ApiBadRequestResponse({
    description:
      'Something is invalid on the request body, or Token is invalid or expired',
  })
  public async confirmEmail(
    @Origin() origin: string | undefined,
    @Body() confirmEmailDto: ConfirmEmailDto,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const result = await this._authService.confirmEmail(confirmEmailDto);
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .send(AuthResponseMapper.map(result));
  }

  @Public()
  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: MessageMapper,
    description:
      'An email has been sent to the user with the reset password link',
  })
  public async forgotPassword(
    @Origin() origin: string | undefined,
    @Body() emailDto: EmailDto,
  ): Promise<IMessage> {
    return this._authService.resetPasswordEmail(emailDto, origin);
  }

  @Public()
  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: MessageMapper,
    description: 'The password has been reset',
  })
  @ApiBadRequestResponse({
    description:
      'Something is invalid on the request body, or Token is invalid or expired',
  })
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<IMessage> {
    return this._authService.resetPassword(resetPasswordDto);
  }

  @Patch('/update-password')
  @ApiOkResponse({
    type: AuthResponseMapper,
    description: 'The password has been updated',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async updatePassword(
    @CurrentUser() userId: string,
    @Origin() origin: string | undefined,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const result = await this._authService.updatePassword(
      userId,
      changePasswordDto,
      origin,
    );
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .send(AuthResponseMapper.map(result));
  }

  @Get('/me')
  @ApiOkResponse({
    type: AuthResponseUserMapper,
    description: 'The user is found and returned.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async getMe(@CurrentUser() id: string): Promise<IAuthResponseUser> {
    const user = await this._usersService.findOneById(id, [ 'assignedCompanies', 'companyUsers' ]);
    return AuthResponseUserMapper.map(user);
  }

  @Post('/active-company')
  @ApiOkResponse({
    type: ResponsePositionsMapper,
    description: 'Update the active company and return the new access token with the active company in the payload.',
  })
  public async updateUserActiveCompany(
    @CurrentUser() id: string,
    @Body('companyId') companyId: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    await this._authService.setActiveCompanyAndRefreshToken(id, companyId);
    const token = this.refreshTokenFromReq(req);
    const result = await this._authService.refreshTokenAccess(
      token,
      req.headers.host,
    );
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .send(AuthResponseMapper.map(result));
  }

  @Get('/providers')
  @ApiOkResponse({
    type: OAuthProvidersResponseMapper,
    description: 'The OAuth providers are returned.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async getOAuthProviders(
    @CurrentUser() id: string,
  ): Promise<IOAuthProvidersResponse> {
    const providers = await this._usersService.findOAuthProviders(id);
    return OAuthProvidersResponseMapper.map(providers);
  }

  private refreshTokenFromReq(req: FastifyRequest): string {
    const token: string | undefined = req.cookies[this.cookieName];

    if (isUndefined(token) || isNull(token)) {
      throw new UnauthorizedException();
    }

    const {valid, value} = req.unsignCookie(token);

    if (!valid) {
      throw new UnauthorizedException();
    }

    return value;
  }

  private saveRefreshCookie(
    res: FastifyReply,
    refreshToken: string,
  ): FastifyReply {
    return res
      .cookie(this.cookieName, refreshToken, {
        secure: true,
        httpOnly: true,
        signed: true,
        path: this.cookiePath,
        expires: new Date(Date.now() + this.refreshTime * 1000),
        sameSite: 'none'
      })
      .header('Content-Type', 'application/json');
  }
}
