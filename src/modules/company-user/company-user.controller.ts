import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';

import { Pageable, PageableDefault }  from '@lib/pageable';
import { CurrentUser }                from '@modules/auth/decorators/current-user.decorator';
import { RequiredRole }               from '@modules/auth/decorators/requierd-role.decorator';
import { MemberGuard }                from '@modules/auth/guards/member.guard';
import { RolesGuard }                 from '@modules/auth/guards/roles.guard';
import { CurrentCompanyId }           from '@modules/company/decorators/company-id.decorator';
import { MembersQueryDto }            from '@modules/company/dtos/members-query.dto';
import { CreateCompanyUserInviteDto } from './dtos/create-company-user-invite.dto';
import { CompanyUserInviteService }   from './company-user-invite.service';
import { CompanyUserService }         from './company-user.service';
import { RoleEnum }                   from './enums/role.enum';
import { MemberInviteFullMapper }     from '@modules/company-user/mappers/member-invite-full.mapper';

@UseGuards(MemberGuard, RolesGuard)
@Controller('company-user')
export class CompanyUserController {
  constructor(
    private readonly _companyUserService: CompanyUserService,
    private readonly _companyUserInviteService: CompanyUserInviteService
  ) { }

  @Get('/:companyId/validate-user')
  public async validateUser(
    @Param('companyId') companyId: string,
    @CurrentUser() userId: string
  ) {
    return await this._companyUserService.isUserInCompany(companyId, userId);
  }

  @Get('/invitations')
  public async getAllInvites(
    @CurrentCompanyId() companyId: string,
  ) {
    const results = await this._companyUserInviteService.getAll(companyId);

    return MemberInviteFullMapper.mapAll(results);
  }

  @Post('/invite')
  @RequiredRole(RoleEnum.ADMIN)
  public async inviteUser(
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: string,
    @Body() createInviteDto: CreateCompanyUserInviteDto
  ) {
    const result = await this._companyUserInviteService.create(createInviteDto, companyId, user);

    return MemberInviteFullMapper.map(result);
  }

  @Get('contacts')
  public async getMembersContacts(
    @CurrentCompanyId() companyId: string,
    @PageableDefault({unpaged: true}) pageable: Pageable,
    @Query() query: MembersQueryDto,
  ) {
    // return await this._companyUserService.getMembersContacts(query, companyId, pageable);
  }

  @Get('contacts/:id')
  public async getContactDetail(
    @CurrentCompanyId() companyId: string,
    @Param('id') id: string,
  ) {
    // return await this._companyUserService.getContactDetail(id, companyId);
  }
}
