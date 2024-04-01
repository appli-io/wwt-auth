import { Injectable }    from '@nestjs/common';
import { OAuth2Client }  from 'google-auth-library';
import { google }        from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuth2Service {
  private oauth2Client: OAuth2Client;

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
    const {token} = await this.oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('Failed to create access token');
    }
    return token;
  }
}
