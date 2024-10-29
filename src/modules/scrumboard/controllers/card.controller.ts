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
import { BoardGateway }       from '@modules/scrumboard/gateways/board.gateway';
import { LabelService }       from '@modules/scrumboard/services/label.service';

@Controller('scrumboard/card')
@UseGuards(MemberGuard)
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly memberService: MemberService,
    private readonly labelService: LabelService,
    private readonly boardGateway: BoardGateway
  ) {}

  @Post()
  async create(
    @CurrentUser() userId: UserEntity['id'],
    @CurrentCompanyId() companyId: CompanyEntity['id'],
    @Body() createCardDto: CreateCardDto
  ) {
    const member = await this.memberService.findOne(userId, companyId);
    const card = await this.cardService.create(createCardDto, member);

    this.boardGateway.server.to('board_' + createCardDto.boardId).emit('cardCreated', card);

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
    const parsedResponse = ResponseCardMapper.map(card);

    this.boardGateway.server.to('board_' + card.board.id).emit('cardUpdated', parsedResponse);

    return parsedResponse;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.cardService.remove(id);

    this.boardGateway.server.to('board_' + result.card.board).emit('cardDeleted', result);

    return result;
  }
}
