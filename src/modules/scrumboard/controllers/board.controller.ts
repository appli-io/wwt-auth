import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';

import { CurrentCompanyId } from '@modules/company/decorators/company-id.decorator';

import { CreateBoardDto } from '../dtos/create-board.dto';
import { UpdateBoardDto } from '../dtos/update-board.dto';
import { BoardService }   from '../services/board.service';
import { MemberService }  from '../services/member.service';

@Controller('scrumboard/boards')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly memberService: MemberService,
  ) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(id);
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
