import { Controller, Get } from '@nestjs/common';
import { SeederService }   from '@modules/seeder/seeder.service';
import { CurrentUser }     from '@modules/auth/decorators/current-user.decorator';

@Controller()
export class AppController {

  constructor(
    private readonly _seederService: SeederService
  ) {}

  @Get('seed/users')
  async seed() {
    await this._seederService.seedUsers();
  }

  @Get('seed/companies')
  async seedCompanies(@CurrentUser() userId: string) {
    await this._seederService.seedCompanies(userId);
  }
}
