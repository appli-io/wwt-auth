import { Injectable } from '@nestjs/common';

import { EntityManager }    from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CardEntity }    from '../entities/card.entity';
import { CreateCardDto } from '../dtos/create-card.dto';
import { UpdateCardDto } from '../dtos/update-card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardEntity) private readonly cardRepository: EntityRepository<CardEntity>,
    private readonly _em: EntityManager,
  ) {}

  create(createCardDto: CreateCardDto) {
    const card = this.cardRepository.create(createCardDto);
    return this._em.persistAndFlush(card);
  }

  findAll() {
    return this.cardRepository.findAll();
  }

  findOne(id: string) {
    return this.cardRepository.findOne(id);
  }

  update(id: string, updateCardDto: UpdateCardDto) {
    return this.cardRepository.nativeUpdate({id}, updateCardDto);
  }

  remove(id: string) {
    return this.cardRepository.nativeDelete({id});
  }
}
