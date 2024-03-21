import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags }      from '@nestjs/swagger';

import { Public }                from '@modules/auth/decorators/public.decorator';
import { CurrentUser }           from '@modules/auth/decorators/current-user.decorator';
import { CompanyService }        from '@modules/company/company.service';
import { CreateCompanyDto }      from '@modules/company/dtos/create-company.dto';
import { ResponseCompanyMapper } from '@modules/company/response-company.mapper';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private _companyService: CompanyService) {}

  @Public()
  @Get()
  @ApiOkResponse({
    description: 'The company is found and returned.',
  })
  public async getCompany(): Promise<ResponseCompanyMapper[]> {
    const company = await this._companyService.findAll();
    return company.map(ResponseCompanyMapper.map);
  }

  @Post()
  public async create(
    @CurrentUser() userId: number,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    const company = await this._companyService.create(createCompanyDto, userId);

    return ResponseCompanyMapper.map(company);
  }
}
