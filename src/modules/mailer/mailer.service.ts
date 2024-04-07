import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService }                     from '@nestjs/config';

import { readFileSync }    from 'fs';
import Handlebars          from 'handlebars';
import { createTransport } from 'nodemailer';
import SMTPTransport       from 'nodemailer/lib/smtp-transport';
import { join }            from 'path';

import { IEmailConfig }  from '@config/interfaces/email-config.interface';
import { OAuth2Service } from '@modules/mailer/oauth2.service';

import { IUser }          from '../users/interfaces/user.interface';
import { ITemplatedData } from './interfaces/template-data.interface';
import { ITemplates }     from './interfaces/templates.interface';

@Injectable()
export class MailerService {
  private readonly loggerService: LoggerService;
  private email: string;
  private domain: string;
  private templates: ITemplates;

  constructor(private readonly _configService: ConfigService, private readonly _gmailService: OAuth2Service) {
    const emailConfig = this._configService.get<IEmailConfig>('emailService');

    this.loggerService = new Logger(MailerService.name);
    this.email = `"Synergiq" <${ emailConfig.auth.user }>`;
    this.domain = this._configService.get<string>('domain');
    this.templates = {
      confirmation: MailerService.parseTemplate('confirmation.hbs'),
      resetPassword: MailerService.parseTemplate('reset-password.hbs'),
    };
  }

  private static parseTemplate(
    templateName: string,
  ): Handlebars.TemplateDelegate<ITemplatedData> {
    const templateText = readFileSync(
      join(__dirname, 'templates', templateName),
      'utf-8',
    );
    return Handlebars.compile<ITemplatedData>(templateText, {strict: true});
  }

  public sendConfirmationEmail(user: IUser, token: string): void {
    const {email, name} = user;
    const subject = 'Confirm your email';
    // If link contain http or https regex search, set domain, else add it
    const domain = this.domain.includes('http') ? this.domain : `https://${ this.domain }`;
    const html = this.templates.confirmation({
      name,
      link: `${ domain }/auth/confirm/${ token }`,
    });
    this.sendEmail(email, subject, html, 'A new confirmation email was sent.').then();
  }

  public sendResetPasswordEmail(user: IUser, token: string): void {
    const {email, name} = user;
    const subject = 'Reset your password';
    const domain = this.domain.includes('http') ? this.domain : `https://${ this.domain }`;
    const html = this.templates.resetPassword({
      name,
      link: `${ domain }/auth/reset-password/${ token }`,
    });
    this.sendEmail(
      email,
      subject,
      html,
      'A new reset password email was sent.',
    ).then();
  }

  public async sendEmail(
    to: string,
    subject: string,
    html: string,
    log?: string,
  ): Promise<void> {
    const emailConfig = this._configService.get<IEmailConfig>('emailService');
    emailConfig.auth.accessToken = await this._gmailService.getAccessToken();
    const transport = createTransport(emailConfig as SMTPTransport.Options);

    transport
      .sendMail({
        from: this.email,
        to,
        subject,
        html,
      })
      .then(() => this.loggerService.log(log ?? 'A new email was sent.'))
      .catch(console.error);
  }
}
