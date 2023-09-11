import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService }                     from '@nestjs/config';

import { readFileSync }                 from 'fs';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport                    from 'nodemailer/lib/smtp-transport';
import { join }                         from 'path';

import { IEmailConfig }   from '@config/interfaces/email-config.interface';
import { ITemplatedData } from '@modules/mailer/interfaces/template-data.interface';
import { ITemplates }     from '@modules/mailer/interfaces/templates.interface';
import { IUser }          from '@modules/users/interfaces/user.interface';

@Injectable()
export class MailerService {
  private readonly loggerService: LoggerService;
  private readonly transport: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly email: string;
  private readonly domain: string;
  private readonly templates: ITemplates;

  constructor( private readonly configService: ConfigService ) {
    this.loggerService = new Logger(MailerService.name);
    const emailConfig = this.configService.get<IEmailConfig>('emailService');
    this.transport = createTransport(emailConfig);
    this.email = `"My App" <${ emailConfig.auth.user }>`;
    this.domain = this.configService.get<string>('domain');

    this.templates = {
      confirmation: MailerService.parseTemplate('confirmation.hbs'),
      resetPassword: MailerService.parseTemplate('reset-password.hbs'),
    };
  }

  public sendEmail(
    to: string,
    subject: string,
    html: string,
    log?: string,
  ): void {
    this.transport
      .sendMail({
        from: this.email,
        to,
        subject,
        html,
      })
      .then(() => this.loggerService.log(log ?? 'A new email was sent.'))
      .catch(( error ) => this.loggerService.error(error));
  }

  public sendConfirmationEmail(user: IUser, token: string): void {
    const { email, name } = user;
    const subject = 'Confirm your email';
    const html = this.templates.confirmation({
      name,
      link: `https://${this.domain}/auth/confirm/${token}`,
    });
    this.sendEmail(email, subject, html, 'A new confirmation email was sent.');
  }

  public sendResetPasswordEmail(user: IUser, token: string): void {
    const { email, name } = user;
    const subject = 'Reset your password';
    const html = this.templates.resetPassword({
      name,
      link: `https://${this.domain}/auth/reset-password/${token}`,
    });
    this.sendEmail(
      email,
      subject,
      html,
      'A new reset password email was sent.',
    );
  }

  private static parseTemplate(
    templateName: string,
  ): Handlebars.TemplateDelegate<ITemplatedData> {
    const templateText = readFileSync(
      join(__dirname, 'templates', templateName),
      'utf-8',
    );
    return Handlebars.compile<ITemplatedData>(templateText, { strict: true });
  }
}
