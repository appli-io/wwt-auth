import { Module }            from '@nestjs/common';
import { JwtModule }         from '../jwt/jwt.module';
import { CompanyUserModule } from '../company-user/company-user.module';
import { MailerModule }      from '../mailer/mailer.module';
import { UsersModule }       from '../users/users.module';
import { AuthController }    from './auth.controller';
import { AuthService }       from './auth.service';
import { CompanyModule }     from '@modules/company/company.module';

@Module({
  imports: [ UsersModule, JwtModule, MailerModule, CompanyUserModule, CompanyModule ],
  providers: [ AuthService ],
  controllers: [ AuthController ],
})
export class AuthModule {
}
