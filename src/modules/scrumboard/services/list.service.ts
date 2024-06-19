import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository }                from '@mikro-orm/nestjs';

import { ListEntity }    from '../entities/list.entity';
import { CreateListDto } from '../dtos/create-list.dto';
import { UpdateListDto } from '../dtos/update-list.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(ListEntity) private readonly listRepository: EntityRepository<ListEntity>,
    private readonly _em: EntityManager,
  ) {}

  async create(createListDto: CreateListDto) {
    const list = this.listRepository.create({
      title: createListDto.title,
      board: createListDto.boardId,
      position: createListDto.position,
    });
    await this._em.persistAndFlush(list);

    return list;
  }

  findAll() {
    return this.listRepository.findAll();
  }

  findOne(id: string) {
    return this.listRepository.findOne(id);
  }

  async update(id: string, updateListDto: UpdateListDto) {
    const list = await this.listRepository.findOne(id);

    if (!list)
      throw new NotFoundException('List not found');

    const updatedListDto = Object.fromEntries(
      Object.entries(updateListDto).filter(([ , value ]) => value !== null && value !== undefined)
    );

    Object.assign(list, updatedListDto);

    await this._em.persistAndFlush(list);

    return list;
  }

  async remove(id: string) {
    const list = await this.listRepository.findOne(id);

    if (!list)
      throw new NotFoundException('List not found');

    await this._em.removeAndFlush(list);

    return {
      deleted: true,
      list
    };
  }
}
