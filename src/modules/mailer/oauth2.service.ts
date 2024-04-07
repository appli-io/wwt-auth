import { Injectable, Logger } from '@nestjs/common';
import { ConfigService }      from '@nestjs/config';

import { OAuth2Client } from 'google-auth-library';
import { google }       from 'googleapis';

@Injectable()
export class OAuth2Service {
  private oauth2Client: OAuth2Client;
  private readonly logger: Logger = new Logger(OAuth2Service.name);

  constructor(private readonly _configService: ConfigService) {
    const emailConfig = this._configService.get('emailService');
    this.oauth2Client = new google.auth.OAuth2(
      emailConfig.auth.clientId,
      emailConfig.auth.clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    this.oauth2Client.setCredentials({
      refresh_token: emailConfig.auth.refreshToken,
    });
  }

  async getAccessToken(): Promise<string> {
    const {token} = await this.oauth2Client.getAccessToken().catch((err) => {
      this.logger.error('Failed to create access token', JSON.stringify(err));
      return {token: undefined};
    });

    if (!token) this.logger.error('Failed to create access token');

    return token;
  }
}
