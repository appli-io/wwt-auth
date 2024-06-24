import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';

import { CurrentCompanyId } from '@modules/company/decorators/company-id.decorator';

import { CreateBoardDto }       from '../dtos/create-board.dto';
import { UpdateBoardDto }       from '../dtos/update-board.dto';
import { BoardService }         from '../services/board.service';
import { MemberService }        from '../services/member.service';
import { MemberGuard }          from '@modules/auth/guards/member.guard';
import { CurrentUser }          from '@modules/auth/decorators/current-user.decorator';
import { UserEntity }           from '@modules/users/entities/user.entity';
import { CompanyEntity }        from '@modules/company/entities/company.entity';
import { ResponseBoardsMapper } from '@modules/scrumboard/mappers/response-boards.mapper';
import { ResponseBoardMapper }  from '@modules/scrumboard/mappers/response-board.mapper';

@Controller('scrumboard/board')
@UseGuards(MemberGuard)
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly memberService: MemberService,
  ) {}

  @Post()
  async create(
    @CurrentUser() userId: UserEntity['id'],
    @CurrentCompanyId() companyId: CompanyEntity['id'],
    @Body() createBoardDto: CreateBoardDto
  ) {
    const member = await this.memberService.findOne(userId, companyId);
    const result = await this.boardService.create(createBoardDto, member, companyId);

    return ResponseBoardMapper.map(result);
  }

  @Get()
  async findAll(
    @CurrentUser() userId: UserEntity['id'],
    @CurrentCompanyId() companyId: CompanyEntity['id']
  ) {
    const boards = await this.boardService.findAll(userId, companyId);

    return boards.map(ResponseBoardsMapper.map);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const board = await this.boardService.findOne(id);

    return ResponseBoardMapper.map(board);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardService.update(id, updateBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardService.remove(id);
  }

  @Patch(':boardId/members/:memberId')
  async addMember(
    @CurrentCompanyId() companyId: string,
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string
  ) {
    const board = await this.boardService.findOne(boardId);
    const member = await this.memberService.findOne(memberId, companyId);
    if (board && member) {
      board.members.add(member);
      return this.boardService.update(boardId, board);
    }
    return null;
  }

  @Delete(':boardId/members/:memberId')
  async removeMember(
    @CurrentCompanyId() companyId: string,
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string
  ) {
    const board = await this.boardService.findOne(boardId);
    const member = await this.memberService.findOne(memberId, companyId);
    if (board && member) {
      board.members.remove(member);
      return this.boardService.update(boardId, board);
    }
    return null;
  }
}
