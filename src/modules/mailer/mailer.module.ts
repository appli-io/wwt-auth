import { Module }        from '@nestjs/common';
import { MailerService } from './mailer.service';
import { OAuth2Service } from './oauth2.service';

@Module({
  providers: [ MailerService, OAuth2Service ],
  exports: [ MailerService ],
})
export class MailerModule {
}
