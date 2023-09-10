import { CACHE_MANAGER }                                                  from '@nestjs/cache-manager';
import { isUndefined }                                                    from '@nestjs/common/utils/shared.utils';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { Cache }   from 'cache-manager';
import { isEmail } from 'class-validator';
import dayjs       from 'dayjs';
import { compare } from 'bcrypt';

import { CommonService }    from '@common/common.service';
import { SLUG_REGEX }       from '@common/consts/regex.const';
import { IMessage }         from '@common/interfaces/message.interface';
import { isNull }           from '@common/utils/validation.util';
import { UsersService }     from '@/modules/users/users.service';
import { JwtService }       from '@/modules/jwt/jwt.service';
import { MailerService }    from '@/modules/mailer/mailer.service';
import { UserEntity }       from '@/modules/users/entities/user.entity';
import { TokenTypeEnum }    from '@/modules/jwt/enums/token-type.enum';
import { SignUpDto }        from '@/modules/auth/dtos/sign-up.dto';
import { SignInDto }        from '@/modules/auth/dtos/sign-in.dto';
import { IAuthResult }      from '@/modules/auth/interfaces/auth-result.interface';
import { ICredentials }     from '@/modules/users/interfaces/credentials.interface';
import { IRefreshToken }    from '@/modules/jwt/enums/refresh-token.interface';
import { EmailDto }         from '@/modules/auth/dtos/email.dto';
import { ResetPasswordDto } from '@/modules/auth/dtos/reset-password.dto';
import { IEmailToken }      from '@/modules/jwt/enums/email-token.interface';

@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository(BlacklistedTokenEntity) private readonly blacklistedTokensRepository: EntityRepository<BlacklistedTokenEntity>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly commonService: CommonService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  public async signUp( dto: SignUpDto, domain?: string ): Promise<IMessage> {
    const { name, email, password1, password2 } = dto;
    this.comparePasswords(password1, password2);
    const user = await this.usersService.create(email, name, password1);
    const confirmationToken = await this.jwtService.generateToken(
      user,
      TokenTypeEnum.CONFIRMATION,
      domain,
    );
    this.mailerService.sendConfirmationEmail(user, confirmationToken);
    return this.commonService.generateMessage('Registration successful');
  }

  public async refreshTokenAccess(
    refreshToken: string,
    domain?: string,
  ): Promise<IAuthResult> {
    const { id, version, tokenId } =
      await this.jwtService.verifyToken<IRefreshToken>(
        refreshToken,
        TokenTypeEnum.REFRESH,
      );
    await this.checkIfTokenIsBlacklisted(id, tokenId);
    const user = await this.usersService.findOneByCredentials(id, version);
    const [ accessToken, newRefreshToken ] = await this.generateAuthTokens(
      user,
      domain,
      tokenId,
    );
    return { user, accessToken, refreshToken: newRefreshToken };
  }

  public async logout( refreshToken: string ): Promise<IMessage> {
    const { id, tokenId, exp } =
      await this.jwtService.verifyToken<IRefreshToken>(
        refreshToken,
        TokenTypeEnum.REFRESH,
      );
    await this.blacklistToken(id, tokenId, exp);
    return this.commonService.generateMessage('Logout successful');
  }

  public async resetPasswordEmail(
    dto: EmailDto,
    domain?: string,
  ): Promise<IMessage> {
    const user = await this.usersService.uncheckedUserByEmail(dto.email);

    if ( !isUndefined(user) && !isNull(user) ) {
      const resetToken = await this.jwtService.generateToken(
        user,
        TokenTypeEnum.RESET_PASSWORD,
        domain,
      );
      this.mailerService.sendResetPasswordEmail(user, resetToken);
    }

    return this.commonService.generateMessage('Reset password email sent');
  }

  public async resetPassword( dto: ResetPasswordDto ): Promise<IMessage> {
    const { password1, password2, resetToken } = dto;
    const { id, version } = await this.jwtService.verifyToken<IEmailToken>(
      resetToken,
      TokenTypeEnum.RESET_PASSWORD,
    );
    this.comparePasswords(password1, password2);
    await this.usersService.resetPassword(id, version, password1);
    return this.commonService.generateMessage('Password reset successful');
  }

  // creates a new blacklisted token in the database with the

  public async singIn( dto: SignInDto, domain?: string ): Promise<IAuthResult> {
    const { emailOrUsername, password } = dto;
    const user = await this.userByEmailOrUsername(emailOrUsername);

    if ( !( await compare(password, user.password) ) ) {
      await this.checkLastPassword(user.credentials, password);
    }
    if ( !user.confirmed ) {
      const confirmationToken = await this.jwtService.generateToken(
        user,
        TokenTypeEnum.CONFIRMATION,
        domain,
      );
      this.mailerService.sendConfirmationEmail(user, confirmationToken);
      throw new UnauthorizedException(
        'Please confirm your email, a new email has been sent',
      );
    }

    const [ accessToken, refreshToken ] = await this.generateAuthTokens(
      user,
      domain,
    );
    return { user, accessToken, refreshToken };
  }

  // ID of the refresh token that was removed with the logout
  private async blacklistToken(
    userId: number,
    tokenId: string,
    exp: number,
  ): Promise<void> {
    const now = dayjs().unix();
    const ttl = ( exp - now ) * 1000;

    if ( ttl > 0 ) {
      await this.commonService.throwInternalError(
        this.cacheManager.set(`blacklist:${ userId }:${ tokenId }`, now, ttl),
      );
    }
  }

  // checks if a token given the ID of the user and ID of token exists on the database
  private async checkIfTokenIsBlacklisted(
    userId: number,
    tokenId: string,
  ): Promise<void> {
    const time = await this.cacheManager.get<number>(
      `blacklist:${ userId }:${ tokenId }`,
    );

    if ( !isUndefined(time) && !isNull(time) ) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private comparePasswords( password1: string, password2: string ): void {
    if ( password1 !== password2 ) {
      throw new BadRequestException('Passwords do not match');
    }
  }

  // validates the input and fetches the user by email or username
  private async userByEmailOrUsername(
    emailOrUsername: string,
  ): Promise<UserEntity> {
    if ( emailOrUsername.includes('@') ) {
      if ( !isEmail(emailOrUsername) ) {
        throw new BadRequestException('Invalid email');
      }

      return this.usersService.findOneByEmail(emailOrUsername);
    }

    if (
      emailOrUsername.length < 3 ||
      emailOrUsername.length > 106 ||
      !SLUG_REGEX.test(emailOrUsername)
    ) {
      throw new BadRequestException('Invalid username');
    }

    return this.usersService.findOneByUsername(emailOrUsername, true);
  }

  // checks if your using your last password
  private async checkLastPassword(
    credentials: ICredentials,
    password: string,
  ): Promise<void> {
    const { lastPassword, passwordUpdatedAt } = credentials;

    if ( lastPassword.length === 0 || !( await compare(password, lastPassword) ) ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = dayjs();
    const time = dayjs.unix(passwordUpdatedAt);
    const months = now.diff(time, 'month');
    const message = 'You changed your password ';

    if ( months > 0 ) {
      throw new UnauthorizedException(
        message + months + ( months > 1 ? ' months ago' : ' month ago' ),
      );
    }

    const days = now.diff(time, 'day');

    if ( days > 0 ) {
      throw new UnauthorizedException(
        message + days + ( days > 1 ? ' days ago' : ' day ago' ),
      );
    }

    const hours = now.diff(time, 'hour');

    if ( hours > 0 ) {
      throw new UnauthorizedException(
        message + hours + ( hours > 1 ? ' hours ago' : ' hour ago' ),
      );
    }

    throw new UnauthorizedException(message + 'recently');
  }

  private async generateAuthTokens(
    user: UserEntity,
    domain?: string,
    tokenId?: string,
  ): Promise<[ string, string ]> {
    return Promise.all([
      this.jwtService.generateToken(
        user,
        TokenTypeEnum.ACCESS,
        domain,
        tokenId,
      ),
      this.jwtService.generateToken(
        user,
        TokenTypeEnum.REFRESH,
        domain,
        tokenId,
      ),
    ]);
  }
}
