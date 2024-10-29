import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager }    from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { CardEntity }        from '../entities/card.entity';
import { CreateCardDto }     from '../dtos/create-card.dto';
import { UpdateCardDto }     from '../dtos/update-card.dto';
import { LabelEntity }       from '@modules/scrumboard/entities/label.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardEntity) private readonly cardRepository: EntityRepository<CardEntity>,
    private readonly _em: EntityManager
  ) {}

  async create(createCardDto: CreateCardDto, member: CompanyUserEntity) {
    const card = this.cardRepository.create({
      ...createCardDto,
      board: createCardDto.boardId,
      list: createCardDto.listId,
      labels: createCardDto.labels?.length > 0 ? createCardDto.labels : undefined,
      owner: member
    });
    card.board.lastActivity = new Date();

    await this._em.persistAndFlush(card);

    return card;
  }

  findAll() {
    return this.cardRepository.findAll();
  }

  findOne(id: string) {
    return this.cardRepository.findOne(id, {populate: [ 'board', 'labels', 'assignees.user' ]});
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    const card = await this.cardRepository.findOne(id, {populate: [ 'board', 'labels', 'assignees.user' ]});
    if (!card)
      throw new NotFoundException('Card not found');

    // omit undefined and null fields
    updateCardDto = Object.keys(updateCardDto).reduce((acc, key) => {
      if (updateCardDto[key] !== undefined && updateCardDto[key] !== null)
        acc[key] = updateCardDto[key];
      return acc;
    }, {});

    const {labels, assignees, ...updateFields} = updateCardDto;

    Object.assign(card, updateFields, {
      list: updateCardDto.listId ? updateCardDto.listId : card.list.id,
    });

    if (labels) {
      const labelsToAdd = updateCardDto.labels.filter(label => !card.labels.find(({id}) => id === label));
      const labelsToRemove = card.labels.filter(label => !updateCardDto.labels.includes(label.id));

      card.labels.add(await this._em.findAll('LabelEntity', {where: {id: {$in: labelsToAdd}}}) as LabelEntity[]);
      card.labels.remove(labelsToRemove);
    }

    if (assignees) {
      const assigneesToAdd = updateCardDto.assignees.filter(assignee => !card.assignees.find(({user}) => user.id === assignee));
      const assigneesToRemove = card.assignees.filter(assignee => !updateCardDto.assignees.includes(assignee.user.id));

      card.assignees.add(await this._em.findAll('CompanyUserEntity', {where: {user: {$in: assigneesToAdd}}}) as CompanyUserEntity[]);
      card.assignees.remove(assigneesToRemove);
    }

    card.board.lastActivity = new Date();

    await this._em.persistAndFlush(card);

    return this.findOne(id);
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
