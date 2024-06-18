import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { MemberGuard }        from '@modules/auth/guards/member.guard';
import { CreateCardDto }      from '../dtos/create-card.dto';
import { UpdateCardDto }      from '../dtos/update-card.dto';
import { CardService }        from '../services/card.service';
import { CurrentUser }        from '@modules/auth/decorators/current-user.decorator';
import { UserEntity }         from '@modules/users/entities/user.entity';
import { CurrentCompanyId }   from '@modules/company/decorators/company-id.decorator';
import { CompanyEntity }      from '@modules/company/entities/company.entity';
import { MemberService }      from '@modules/scrumboard/services/member.service';
import { ResponseCardMapper } from '@modules/scrumboard/mappers/response-card.mapper';

@Controller('scrumboard/card')
@UseGuards(MemberGuard)
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly memberService: MemberService
  ) {}

  @Post()
  async create(
    @CurrentUser() userId: UserEntity['id'],
    @CurrentCompanyId() companyId: CompanyEntity['id'],
    @Body() createCardDto: CreateCardDto
  ) {
    const member = await this.memberService.findOne(userId, companyId);
    const card = await this.cardService.create(createCardDto, member);

    return ResponseCardMapper.map(card);
  }

  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    const card = await this.cardService.update(id, updateCardDto);

    return ResponseCardMapper.map(card);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(id);
  }
}
