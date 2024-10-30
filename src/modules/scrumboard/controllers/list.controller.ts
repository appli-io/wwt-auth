import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';

import { MemberGuard }         from '@modules/auth/guards/member.guard';
import { CreateListDto }       from '../dtos/create-list.dto';
import { UpdateListDto }       from '../dtos/update-list.dto';
import { ListService }         from '../services/list.service';
import { BoardGateway }        from '@modules/scrumboard/gateways/board.gateway';
import { ResponseListsMapper } from '@modules/scrumboard/mappers/response-lists.mapper';

@Controller('scrumboard/list')
@UseGuards(MemberGuard)
export class ListController {
  constructor(
    private readonly listService: ListService,
    private readonly boardGateway: BoardGateway
  ) {}

  @Post()
  async create(@Body() createListDto: CreateListDto) {
    const list = await this.listService.create(createListDto);

    this.boardGateway.server.to('board_' + createListDto.boardId).emit('listCreated', list);

    return list;
  }

  @Get()
  findAll() {
    return this.listService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listService.findOne(id);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    const result = await this.listService.update(id, updateListDto);

    return ResponseListsMapper.map(result);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    const result = await this.listService.update(id, updateListDto);

    this.boardGateway.server.to('board_' + result.board).emit('listUpdated', result);

    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.listService.remove(id);

    this.boardGateway.server.to('board_' + result.list.board).emit('listDeleted', result);

    return result;
  }
}
