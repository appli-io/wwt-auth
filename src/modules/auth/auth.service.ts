import { CACHE_MANAGER }                                                                       from '@nestjs/cache-manager';
import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException, } from '@nestjs/common';
import { compare }                                                                             from 'bcrypt';
import { Cache }                                                                               from 'cache-manager';
import { isEmail }                                                                             from 'class-validator';
import dayjs                                                                                   from 'dayjs';
import { CommonService }                                                                       from '@common/common.service';
import { SLUG_REGEX }                                                                          from '@common/consts/regex.const';
import { IMessage }                                                                            from '@common/interfaces/message.interface';
import { isNull, isUndefined }                                                                 from '@common/utils/validation.util';
import { TokenTypeEnum }                                                                       from '../jwt/enums/token-type.enum';
import { IEmailToken }                                                                         from '../jwt/interfaces/email-token.interface';
import { IRefreshToken }                                                                       from '../jwt/interfaces/refresh-token.interface';
import { JwtService }                                                                          from '../jwt/jwt.service';
import { MailerService }                                                                       from '../mailer/mailer.service';
import { UserEntity }                                                                          from '../users/entities/user.entity';
import { OAuthProvidersEnum }                                                                  from '../users/enums/oauth-providers.enum';
import { ICredentials }                                                                        from '../users/interfaces/credentials.interface';
import { UsersService }                                                                        from '../users/users.service';
import { ChangePasswordDto }                                                                   from './dtos/change-password.dto';
import { ConfirmEmailDto }                                                                     from './dtos/confirm-email.dto';
import { EmailDto }                                                                            from './dtos/email.dto';
import { ResetPasswordDto }                                                                    from './dtos/reset-password.dto';
import { SignInDto }                                                                           from './dtos/sign-in.dto';
import { SignUpDto }                                                                           from './dtos/sign-up.dto';
import { IAuthResult }                                                                         from './interfaces/auth-result.interface';
import { CompanyUserService }                                                                  from '@modules/company-user/company-user.service';
import { CompanyService }                                                                      from '@modules/company/company.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly commonService: CommonService,
    private readonly usersService: UsersService,
    private readonly companyService: CompanyService,
    private readonly companyUserService: CompanyUserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {
  }

  public async signUp(dto: SignUpDto, domain?: string): Promise<IMessage> {
    const {firstname, lastname, email, password1, password2} = dto;
    this.comparePasswords(password1, password2);

    if (dto.token) await this.companyUserService.validateTokenAndUsersEmail(dto.token, email);
    else if (dto.company) await this.companyService.validateCompany(dto.company);

    const user = await this.usersService.create(
      OAuthProvidersEnum.LOCAL,
      email,
      firstname,
      lastname,
      password1,
    );

    const confirmationToken = await this.jwtService.generateToken(
      user,
      TokenTypeEnum.CONFIRMATION,
      domain,
    );

    if (dto.token) {
      const companyUser = await this.companyUserService.assignCompanyToUserByInviteToken(dto.token, user);
      await this.usersService.setActiveCompany(user.id, companyUser.company.id);
    }
    else if (dto.company) await this.companyService.create(dto.company, undefined, user.id);

    this.mailerService.sendConfirmationEmail(user, confirmationToken);
    return this.commonService.generateMessage('Registration successful');
  }

  public async confirmEmail(
    dto: ConfirmEmailDto,
    domain?: string,
  ): Promise<IAuthResult> {
    const {confirmationToken} = dto;
    const {id, version} = await this.jwtService.verifyToken<IEmailToken>(
      confirmationToken,
      TokenTypeEnum.CONFIRMATION,
      domain
    );
    const user = await this.usersService.confirmEmail(id, version);
    const [ accessToken, refreshToken ] =
      await this.jwtService.generateAuthTokens(user, domain);
    return {user, accessToken, refreshToken};
  }

  public async signIn(dto: SignInDto, domain?: string): Promise<IAuthResult> {
    const {emailOrUsername, password} = dto;
    const user = await this.userByEmailOrUsername(emailOrUsername);

    if (!(await compare(password, user.password))) {
      await this.checkLastPassword(user.credentials, password);
    }
    if (!user.confirmed) {
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

    const [ accessToken, refreshToken ] =
      await this.jwtService.generateAuthTokens(user, domain);
    return {user, company: user.activeCompany, accessToken, refreshToken};
  }

  public async refreshTokenAccess(
    refreshToken: string,
    domain?: string,
  ): Promise<IAuthResult> {
    const {id, version, tokenId} =
      await this.jwtService.verifyToken<IRefreshToken>(
        refreshToken,
        TokenTypeEnum.REFRESH,
        domain
      );
    await this.checkIfTokenIsBlacklisted(id, tokenId);
    const user = await this.usersService.findOneByCredentials(id, version);
    const [ accessToken, newRefreshToken ] = await this.jwtService.generateAuthTokens(user, domain, tokenId);
    return {user, company: user.activeCompany || undefined, accessToken, refreshToken: newRefreshToken};
  }

  public async logout(refreshToken: string): Promise<IMessage> {
    const {id, tokenId, exp} =
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

    if (!isUndefined(user) && !isNull(user)) {
      const resetToken = await this.jwtService.generateToken(
        user,
        TokenTypeEnum.RESET_PASSWORD,
        domain,
      );
      this.mailerService.sendResetPasswordEmail(user, resetToken);
    }

    return this.commonService.generateMessage('Reset password email sent');
  }

  public async resetPassword(dto: ResetPasswordDto): Promise<IMessage> {
    const {password1, password2, resetToken} = dto;
    const {id, version} = await this.jwtService.verifyToken<IEmailToken>(
      resetToken,
      TokenTypeEnum.RESET_PASSWORD,
    );
    this.comparePasswords(password1, password2);
    await this.usersService.resetPassword(id, version, password1);
    return this.commonService.generateMessage('Password reset successfully');
  }

  public async updatePassword(
    userId: string,
    dto: ChangePasswordDto,
    domain?: string,
  ): Promise<IAuthResult> {
    const {password1, password2, password} = dto;
    this.comparePasswords(password1, password2);
    const user = await this.usersService.updatePassword(
      userId,
      password1,
      password,
    );
    const [ accessToken, refreshToken ] =
      await this.jwtService.generateAuthTokens(user, domain);
    return {user, accessToken, refreshToken};
  }

  public async setActiveCompanyAndRefreshToken(userId: string, companyId: string) {
    const findMember = await this.companyUserService.findOne(userId, companyId);

    if (!findMember) throw new ForbiddenException('USER_NOT_IN_COMPANY');
    if (!findMember.isActive) throw new ForbiddenException('USER_NOT_ACTIVE_IN_COMPANY');

    await this.usersService.setActiveCompany(userId, companyId);
  }

  private async checkLastPassword(
    credentials: ICredentials,
    password: string,
  ): Promise<void> {
    const {lastPassword, passwordUpdatedAt} = credentials;

    if (lastPassword.length === 0 || !(await compare(password, lastPassword))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = dayjs();
    const time = dayjs.unix(passwordUpdatedAt);
    const months = now.diff(time, 'month');
    const message = 'You changed your password ';

    if (months > 0) {
      throw new UnauthorizedException(
        message + months + (months > 1 ? ' months ago' : ' month ago'),
      );
    }

    const days = now.diff(time, 'day');

    if (days > 0) {
      throw new UnauthorizedException(
        message + days + (days > 1 ? ' days ago' : ' day ago'),
      );
    }

    const hours = now.diff(time, 'hour');

    if (hours > 0) {
      throw new UnauthorizedException(
        message + hours + (hours > 1 ? ' hours ago' : ' hour ago'),
      );
    }

    throw new UnauthorizedException(message + 'recently');
  }

  private async checkIfTokenIsBlacklisted(
    userId: string,
    tokenId: string,
  ): Promise<void> {
    const time = await this.cacheManager.get<number>(
      `blacklist:${ userId }:${ tokenId }`,
    );

    if (!isUndefined(time) && !isNull(time)) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async blacklistToken(
    userId: string,
    tokenId: string,
    exp: number,
  ): Promise<void> {
    const now = dayjs().unix();
    const ttl = (exp - now) * 1000;

    if (ttl > 0) {
      await this.commonService.throwInternalError(
        this.cacheManager.set(`blacklist:${ userId }:${ tokenId }`, now, ttl),
      );
    }
  }

  private comparePasswords(password1: string, password2: string): void {
    if (password1 !== password2) {
      throw new BadRequestException('Passwords do not match');
    }
  }

  private async userByEmailOrUsername(
    emailOrUsername: string,
  ): Promise<UserEntity> {
    if (emailOrUsername.includes('@')) {
      if (!isEmail(emailOrUsername)) {
        throw new BadRequestException('Invalid email');
      }

      const user = await this.usersService.findOneByEmail(emailOrUsername, [ 'assignedCompanies', 'companyUsers', 'activeCompany' ]);

      if (isUndefined(user) || isNull(user)) throw new UnauthorizedException('Invalid credentials');

      return user;
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
}
