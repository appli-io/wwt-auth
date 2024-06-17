import { Injectable } from '@nestjs/common';

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

  create(createListDto: CreateListDto) {
    const list = this.listRepository.create(createListDto);
    return this._em.persistAndFlush(list);
  }

  findAll() {
    return this.listRepository.findAll();
  }

  findOne(id: string) {
    return this.listRepository.findOne(id);
  }

  update(id: string, updateListDto: UpdateListDto) {
    return this.listRepository.nativeUpdate({id}, updateListDto);
  }

  remove(id: string) {
    return this.listRepository.nativeDelete({id});
  }
}
