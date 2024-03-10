import { Controller, Get }        from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CompanyService }         from '@modules/company/company.service';
import { Public }                 from '@modules/auth/decorators/public.decorator';
import { ICompany }               from '@modules/company/interfaces/company.interface';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private _companyService: CompanyService) {}

  @Public()
  @Get()
  @ApiOkResponse({
    description: 'The company is found and returned.',
  })
  public async getCompany(): Promise<ICompany[]> {
    return this._companyService.findAll();
  }
}
