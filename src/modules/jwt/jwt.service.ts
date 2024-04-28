import { BadRequestException, Injectable, InternalServerErrorException, } from '@nestjs/common';
import { ConfigService }                                                  from '@nestjs/config';
import * as jwt                                                           from 'jsonwebtoken';
import { v4 }                                                             from 'uuid';
import { CommonService }                                                  from '@common/common.service';
import { IJwt }                                                           from '@config/interfaces/jwt.interface';
import { TokenTypeEnum }                                                  from './enums/token-type.enum';
import { IAccessPayload, IAccessToken, }                                  from './interfaces/access-token.interface';
import { IEmailPayload, IEmailToken }                                     from './interfaces/email-token.interface';
import { IRefreshPayload, IRefreshToken, }                                from './interfaces/refresh-token.interface';
import { UserEntity }                                                     from '@modules/users/entities/user.entity';

@Injectable()
export class JwtService {
  private readonly jwtConfig: IJwt;
  private readonly issuer: string;
  private readonly domain: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {
    this.jwtConfig = this.configService.get<IJwt>('jwt');
    this.issuer = this.configService.get<string>('id');
    this.domain = this.configService.get<string>('domain');
  }

  private static async generateTokenAsync(
    payload: IAccessPayload | IEmailPayload | IRefreshPayload,
    secret: string,
    options: jwt.SignOptions,
  ): Promise<string> {
    return new Promise((resolve, rejects) => {
      jwt.sign(payload, secret, options, (error, token) => {
        if (error) {
          rejects(error);
          return;
        }
        resolve(token);
      });
    });
  }

  private static async verifyTokenAsync<T>(
    token: string,
    secret: string,
    options: jwt.VerifyOptions,
  ): Promise<T> {
    return new Promise((resolve, rejects) => {
      jwt.verify(token, secret, options, (error, payload: T) => {
        if (error) {

          rejects(error);
          return;
        }
        resolve(payload);
      });
    });
  }

  private static async throwBadRequest<
    T extends IAccessToken | IRefreshToken | IEmailToken,
  >(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('Invalid token', error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }

  public async generateToken(
    user: UserEntity,
    tokenType: TokenTypeEnum,
    domain?: string | null,
    tokenId?: string,
  ): Promise<string> {
    const jwtOptions: jwt.SignOptions = {
      issuer: this.issuer,
      subject: user.email,
      audience: domain ?? this.domain,
      algorithm: 'HS256',
    };

    switch (tokenType) {
      case TokenTypeEnum.ACCESS:
        const {privateKey, time: accessTime} = this.jwtConfig.access;
        return this.commonService.throwInternalError(
          JwtService.generateTokenAsync({id: user.id, companyId: user.activeCompany?.id}, privateKey, {
            ...jwtOptions,
            expiresIn: accessTime,
            algorithm: 'RS256',
          }),
        );
      case TokenTypeEnum.REFRESH:
        const {secret: refreshSecret, time: refreshTime} =
          this.jwtConfig.refresh;
        return this.commonService.throwInternalError(
          JwtService.generateTokenAsync(
            {
              id: user.id,
              companyId: user.activeCompany?.id,
              version: user.credentials.version,
              tokenId: tokenId ?? v4(),
            },
            refreshSecret,
            {
              ...jwtOptions,
              expiresIn: refreshTime,
            },
          ),
        );
      case TokenTypeEnum.CONFIRMATION:
      case TokenTypeEnum.RESET_PASSWORD:
        const {secret, time} = this.jwtConfig[tokenType];
        return this.commonService.throwInternalError(
          JwtService.generateTokenAsync(
            {id: user.id, companyId: user.activeCompany?.id, version: user.credentials.version},
            secret,
            {
              ...jwtOptions,
              expiresIn: time,
            },
          ),
        );
    }
  }

  public async verifyToken<
    T extends IAccessToken | IRefreshToken | IEmailToken,
  >(token: string, tokenType: TokenTypeEnum, origin?: string): Promise<T> {
    const jwtOptions: jwt.VerifyOptions = {
      issuer: this.issuer,
    };

    if (origin) jwtOptions.audience = new RegExp(origin);

    switch (tokenType) {
      case TokenTypeEnum.ACCESS:
        const {publicKey, time: accessTime} = this.jwtConfig.access;
        return JwtService.throwBadRequest(
          JwtService.verifyTokenAsync(token, publicKey, {
            ...jwtOptions,
            maxAge: accessTime,
            algorithms: [ 'RS256' ],
          }),
        );
      case TokenTypeEnum.REFRESH:
      case TokenTypeEnum.CONFIRMATION:
      case TokenTypeEnum.RESET_PASSWORD:
        const {secret, time} = this.jwtConfig[tokenType];
        return JwtService.throwBadRequest(
          JwtService.verifyTokenAsync(token, secret, {
            ...jwtOptions,
            maxAge: time,
            algorithms: [ 'HS256' ],
          }),
        );
    }
  }

  public async generateAuthTokens(
    user: UserEntity,
    domain?: string,
    tokenId?: string,
  ): Promise<[ string, string ]> {
    return Promise.all([
      this.generateToken(user, TokenTypeEnum.ACCESS, domain, tokenId),
      this.generateToken(user, TokenTypeEnum.REFRESH, domain, tokenId),
    ]);
  }
}
