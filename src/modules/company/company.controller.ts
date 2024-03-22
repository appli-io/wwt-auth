import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards
}                                 from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Public }                from '@modules/auth/decorators/public.decorator';
import { CurrentUser }           from '@modules/auth/decorators/current-user.decorator';
import { RequiredRole }          from '@modules/auth/decorators/requierd-role.decorator';
import { RolesGuard }            from '@modules/auth/guards/roles.guard';
import { CompanyService }        from '@modules/company/company.service';
import { CreateCompanyDto }      from '@modules/company/dtos/create-company.dto';
import { ResponseCompanyMapper } from '@modules/company/response-company.mapper';
import { CurrentCompanyId }      from '@modules/company/decorators/company-id.decorator';
import { AddUserToCompanyDto }   from '@modules/company/dtos/add-user-to-company.dto';
import { RoleEnum }              from '@modules/company-user/enums/role.enum';
import { CompanyUserService }    from '@modules/company-user/company-user.service';

@ApiTags('Company')
@Controller('company')
@UseGuards(RolesGuard)
export class CompanyController {
  constructor(
    private _companyService: CompanyService,
    private _companyUserService: CompanyUserService
  ) {}

  @Public()
  @Get()
  @ApiOkResponse({
    description: 'The company is found and returned.',
  })
  public async getCompanies(): Promise<ResponseCompanyMapper[]> {
    const company = await this._companyService.findAll();
    return company.map(ResponseCompanyMapper.map);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The company is found and returned.',
  })
  public async getCompany(@Param('id') companyId: string) {
    if (!companyId) throw new BadRequestException('Company id is required');
    const company = await this._companyService.findById(companyId);

    if (!company) throw new NotFoundException('Company not found');
    return ResponseCompanyMapper.map(company);
  }

  @Post()
  public async create(
    @CurrentUser() userId: number,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    const company = await this._companyService.create(createCompanyDto, userId);

    return ResponseCompanyMapper.map(company);
  }

  @Post('member')
  @RequiredRole(RoleEnum.ADMIN)
  public async addUsersToCompany(
    @CurrentCompanyId() companyId: string,
    @Body() addUserToCompanyDto: AddUserToCompanyDto,
  ) {
    await this._companyUserService.assignCompanyToUser(companyId, addUserToCompanyDto);
  }

  @Delete('member/:id')
  @RequiredRole(RoleEnum.ADMIN)
  public async removeUserFromCompany(
    @Param('id', ParseIntPipe) memberId: number,
    @CurrentCompanyId() companyId: string
  ) {
    if (!memberId) throw new BadRequestException('Member id is required');

    await this._companyUserService.removeCompanyFromUser(companyId, memberId);
  }
}
