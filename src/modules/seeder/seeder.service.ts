import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { IConfig }                           from '@config/interfaces/config.interface';
import { ConfigService }                     from '@nestjs/config';
import { UsersService }                      from '@modules/users/users.service';
import { AppService, CreateUserDto }         from '../../app.service';
import { OAuthProvidersEnum }                from '@modules/users/enums/oauth-providers.enum';
import { CompanyService }                    from '@modules/company/company.service';
import { CreateCompanyDto }                  from '@modules/company/dtos/create-company.dto';

@Injectable()
export class SeederService {
  private readonly logger: LoggerService;

  constructor(
    private readonly _configService: ConfigService<IConfig>,
    private readonly _userService: UsersService,
    private readonly _companyService: CompanyService
  ) {
    this.logger = new Logger(AppService.name);
  }

  public async seedUsers() {
    // Seed adminUser
    const users: CreateUserDto[] = [
      {
        provider: OAuthProvidersEnum.LOCAL,
        email: 'david.misa97@gmail.com',
        name: 'David Misael Villegas Sandoval',
        password: this._configService.get('prefilledUserPassword', {infer: true}),
        confirmed: true
      },
      {
        provider: OAuthProvidersEnum.LOCAL,
        email: 'david.misa001@gmail.com',
        name: 'David Misael Villegas Sandoval',
        password: this._configService.get('prefilledUserPassword', {infer: true}),
        confirmed: true
      }
    ];

    const promises = users.map(async (user) => {
      try {

        // Check if user already exists
        const existingUser = await this._userService.findOneByEmail(user.email);
        // If exist user, do nothing
        if (existingUser) return;
        await this._userService.create(user.provider, user.email, user.name, user.password, user.confirmed);
      } catch (e) {
        console.error(e);
      }
    });

    await Promise.all(promises);
  }

  public async seedCompanies(userId: string) {
    // Seed companies
    const companies: CreateCompanyDto[] = [
      {
        name: 'WeWorkTogether',
        username: 'weworktogether',
        nationalId: '1-9',
        email: 'contact@weworktogether.com',
        country: 'CL',
        description: 'WeWorkTogether is a company that provides software solutions for companies',
        website: undefined
      }
    ];

    const promises = companies.map(async (company) => {
      try {
        await this._companyService.create(company, undefined, userId);
      } catch (e) {
        console.error(e);
      }
    });
  }
}
