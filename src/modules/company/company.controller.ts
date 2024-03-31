import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards
}                                                                from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

import { Pageable, PageableDefault } from '@lib/pageable';
import { PageableResponseDto }       from '@lib/pageable/dtos/page-response.dto';
import { Public }                    from '@modules/auth/decorators/public.decorator';
import { CurrentUser }               from '@modules/auth/decorators/current-user.decorator';
import { RequiredRole }              from '@modules/auth/decorators/requierd-role.decorator';
import { RolesGuard }                from '@modules/auth/guards/roles.guard';
import { CompanyService }            from '@modules/company/company.service';
import { CreateCompanyDto }          from '@modules/company/dtos/create-company.dto';
import { ResponseCompanyMapper }     from '@modules/company/response-company.mapper';
import { CurrentCompanyId }          from '@modules/company/decorators/company-id.decorator';
import { AddUserToCompanyDto }       from '@modules/company/dtos/add-user-to-company.dto';
import { RoleEnum }                  from '@modules/company-user/enums/role.enum';
import { CompanyUserService }        from '@modules/company-user/company-user.service';
import { MemberGuard }               from '@modules/auth/guards/member.guard';
import { MemberUnneeded }            from '@modules/auth/decorators/member-unneeded.decorator';

@ApiTags('Company')
@Controller('company')
@UseGuards(MemberGuard, RolesGuard)
export class CompanyController {
  constructor(
    private _companyService: CompanyService,
    private _companyUserService: CompanyUserService
  ) {}

  @Public()
  @Get()
  @MemberUnneeded()
  @ApiExtraModels(PageableResponseDto, ResponseCompanyMapper)
  @ApiOkResponse({
    description: 'The company is found and returned.',
    type: () => PageableResponseDto,
    schema: {
      allOf: [
        {$ref: getSchemaPath(PageableResponseDto)},
        {
          properties: {
            content: {
              type: 'array',
              items: {$ref: getSchemaPath(ResponseCompanyMapper)},
            },
          },
        },
      ],
    },
  })
  public async getCompanies(@PageableDefault() pageable: Pageable, @Query() query: any): Promise<PageableResponseDto<ResponseCompanyMapper>> {
    console.log('query', query);
    const companyPage = await this._companyService.findAll(pageable);

    return {
      ...companyPage,
      content: companyPage.content.map(ResponseCompanyMapper.map)
    };
  }

  @Get(':id')
  @MemberUnneeded()
  @ApiOkResponse({
    description: 'The company is found and returned.',
    type: ResponseCompanyMapper,
  })
  public async getCompany(@Param('id', ParseUUIDPipe) companyId: string): Promise<ResponseCompanyMapper> {
    if (!companyId) throw new BadRequestException('Company id is required');
    const company = await this._companyService.findById(companyId);

    if (!company) throw new NotFoundException('Company not found');
    return ResponseCompanyMapper.map(company);
  }

  @Get('active')
  @ApiOkResponse({
    description: 'The company is found and returned.',
  })
  public async getActiveCompanies(
    @CurrentCompanyId() companyId: string
  ): Promise<ResponseCompanyMapper> {
    const company = await this._companyService.findById(companyId);
    return ResponseCompanyMapper.map(company);
  }

  @Post()
  @MemberUnneeded()
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiredRole(RoleEnum.ADMIN)
  public async removeUserFromCompany(
    @Param('id', ParseIntPipe) memberId: number,
    @CurrentCompanyId() companyId: string
  ) {
    if (!memberId) throw new BadRequestException('Member id is required');

    await this._companyUserService.removeCompanyFromUser(companyId, memberId);
  }
}
