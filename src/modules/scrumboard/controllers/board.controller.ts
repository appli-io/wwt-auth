import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';

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
import { CreateLabelDto }       from '@modules/scrumboard/dtos/create-label.dto';
import { LabelService }         from '@modules/scrumboard/services/label.service';

@Controller('scrumboard/board')
@UseGuards(MemberGuard)
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly memberService: MemberService,
    private readonly labelService: LabelService
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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    const board = await this.boardService.findOne(id);

    Object.assign(board, updateBoardDto);

    const response = await this.boardService.update(board);

    return ResponseBoardMapper.map(response);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardService.remove(id);
  }

  @Patch(':boardId/members')
  async addMember(
    @CurrentCompanyId() companyId: string,
    @Param('boardId') boardId: string,
    @Body('memberId') memberId: string
  ) {
    const board = await this.boardService.findOne(boardId);
    const member = await this.memberService.findOne(memberId, companyId);
    if (!board || !member) throw new NotFoundException('Board or member not found');

    board.members.add(member);
    const updatedBoard = await this.boardService.update(board);

    return ResponseBoardMapper.map(updatedBoard);
  }

  @Delete(':boardId/members/:memberId')
  async removeMember(
    @CurrentCompanyId() companyId: string,
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string
  ) {
    const board = await this.boardService.findOne(boardId);
    const member = await this.memberService.findOne(memberId, companyId);
    if (!board || !member)
      throw new NotFoundException('Board or member not found');

    board.members.remove(member);
    const updatedBoard = await this.boardService.update(board);

    return ResponseBoardMapper.map(updatedBoard);
  }

  @Post(':boardId/labels')
  async addLabel(
    @Param('boardId') boardId: string,
    @Body() createLabelDto: CreateLabelDto
  ) {
    const board = await this.boardService.findOne(boardId);
    if (!board) throw new NotFoundException('Board not found');

    const updatedBoard = await this.labelService.create(boardId, createLabelDto);

    return {
      id: updatedBoard.id,
      title: updatedBoard.title,
      boardId: updatedBoard.board
    };
  }

  @Delete(':boardId/labels/:labelId')
  async removeLabel(
    @Param('boardId') boardId: string,
    @Param('labelId') labelId: string
  ) {
    const board = await this.boardService.findOne(boardId);
    if (!board) throw new NotFoundException('Board not found');

    const label = await this.labelService.findOne(labelId);
    if (!label) throw new NotFoundException('Label not found');

    await this.labelService.remove(labelId);

    return {
      deleted: true,
      label
    };
  }
}
