import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager }    from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CardEntity }        from '../entities/card.entity';
import { CreateCardDto }     from '../dtos/create-card.dto';
import { UpdateCardDto }     from '../dtos/update-card.dto';
import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardEntity) private readonly cardRepository: EntityRepository<CardEntity>,
    private readonly _em: EntityManager,
  ) {}

  async create(createCardDto: CreateCardDto, member: CompanyUserEntity) {
    const card = this.cardRepository.create({
      ...createCardDto,
      board: createCardDto.boardId,
      list: createCardDto.listId,
      labels: createCardDto.labels?.length > 0 ? createCardDto.labels : undefined,
      owner: member
    });

    await this._em.persistAndFlush(card);

    return card;
  }

  findAll() {
    return this.cardRepository.findAll();
  }

  findOne(id: string) {
    return this.cardRepository.findOne(id);
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    const card = await this.cardRepository.findOne(id);
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const updatedCardDto = Object.fromEntries(
      Object.entries(updateCardDto).filter(([ , value ]) => value !== null && value !== undefined)
    );

    Object.assign(card, updatedCardDto, {
      list: updateCardDto.listId ? updateCardDto.listId : card.list.id,
    });

    console.log(card);

    await this._em.persistAndFlush(card);

    return card;
  }

  async remove(id: string) {
    const card = await this.cardRepository.findOne(id);

    if (!card)
      throw new NotFoundException('Card not found');

    await this.cardRepository.nativeDelete({id});

    return {
      deleted: true,
      card
    };
  }
}
