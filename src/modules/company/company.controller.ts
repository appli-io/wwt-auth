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
  UploadedFile,
  UseGuards,
  UseInterceptors
}                                                 from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Page, Pageable, PageableDefault } from '@lib/pageable';
import { PageableResponseDto }             from '@lib/pageable/dtos/page-response.dto';
import { Public }                          from '@modules/auth/decorators/public.decorator';
import { CurrentUser }                     from '@modules/auth/decorators/current-user.decorator';
import { MemberUnneeded }                  from '@modules/auth/decorators/member-unneeded.decorator';
import { RequiredRole }                    from '@modules/auth/decorators/requierd-role.decorator';
import { RolesGuard }                      from '@modules/auth/guards/roles.guard';
import { MemberGuard }                     from '@modules/auth/guards/member.guard';
import { CompanyService }                  from '@modules/company/company.service';
import { CompanyQueryDto }                 from '@modules/company/dtos/company-query.dto';
import { CreateCompanyDto }                from '@modules/company/dtos/create-company.dto';
import { MembersQueryDto }                 from '@modules/company/dtos/members-query.dto';
import { ResponseCompanyMemberMapper }     from '@modules/company/mapper/response-company-member.mapper';
import { CompanyEntity }                   from '@modules/company/entities/company.entity';
import { CurrentCompanyId }                from '@modules/company/decorators/company-id.decorator';
import { AddUserToCompanyDto }             from '@modules/company/dtos/add-user-to-company.dto';
import { ResponseCompanyMapper }           from '@modules/company/mapper/response-company.mapper';
import { RoleEnum }                        from '@modules/company-user/enums/role.enum';
import { CompanyUserService }              from '@modules/company-user/company-user.service';
import { FileInterceptor }                 from '@nest-lab/fastify-multer';

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
    type: () => PageableResponseDto<ResponseCompanyMapper>
  })
  public async getCompanies(
    @PageableDefault() pageable: Pageable,
    @Query() query: CompanyQueryDto
  ): Promise<PageableResponseDto<ResponseCompanyMapper>> {
    const companyPage: Page<CompanyEntity> = await this._companyService.findAll(query, pageable);

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
  @UseInterceptors(FileInterceptor('logo'))
  public async create(
    @CurrentUser() userId: string,
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFile() logo: Express.Multer.File
  ) {
    const company = await this._companyService.create(createCompanyDto, logo, userId);

    return ResponseCompanyMapper.map(company);
  }

  @Get('members')
  public async getMembers(
    @CurrentCompanyId() companyId: string,
    @PageableDefault({unpaged: true}) pageable: Pageable,
    @Query() query: MembersQueryDto
  ) {
    const members = await this._companyUserService.getMembers(companyId, query, pageable);

    return {
      ...members,
      content: members.content.map(ResponseCompanyMemberMapper.map)
    };
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
    @Param('id', ParseIntPipe) memberId: string,
    @CurrentCompanyId() companyId: string
  ) {
    if (!memberId) throw new BadRequestException('Member id is required');

    await this._companyUserService.removeCompanyFromUser(companyId, memberId);
  }

  // @Get('member/:id/contact')
  // @ApiOkResponse({
  //   type: ResponseUserMapper,
  //   description: 'The user is found and returned.',
  // })
  // public async getContactCard(
  //   @Param('id') id: number,
  // ) {
  //   const user = await this._usersService.findUserContact(id);
  //   return ResponseFullUserMapper.map(user);
  // }
}
