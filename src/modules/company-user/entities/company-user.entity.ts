import { Collection, Entity, Enum, ManyToMany, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core';

import { IsOptional, IsString } from 'class-validator';

import { CompanyEntity }      from '@modules/company/entities/company.entity';
import { RoleEnum }           from '@modules/company-user/enums/role.enum';
import { UsersContactEntity } from '@modules/company-user/entities/users-contact.entity';
import { BoardEntity }        from '@modules/scrumboard/entities/board.entity';
import { CardEntity }         from '@modules/scrumboard/entities/card.entity';
import { UserEntity }         from '@modules/users/entities/user.entity';

@Entity({tableName: 'company_user'})
@Unique({properties: [ 'user', 'company' ]})
export class CompanyUserEntity {
  @ManyToOne({primary: true, entity: () => UserEntity})
  public user: UserEntity;

  @ManyToOne({primary: true, entity: () => CompanyEntity})
  public company: CompanyEntity;

  @Property({columnType: 'boolean', default: true})
  public isActive: boolean;

  @Enum({items: () => RoleEnum, default: RoleEnum.USER})
  public role: RoleEnum;

  @Property({columnType: 'varchar', length: 255, nullable: true})
  @IsString()
  @IsOptional()
  public position?: string;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt?: Date;

  @OneToMany(() => UsersContactEntity, (contact) => contact.companyUser)
  public contacts = new Collection<UsersContactEntity>(this);

  @OneToMany(() => CardEntity, (card) => card.owner)
  public ownedCards = new Collection<CardEntity>(this);

  @OneToMany(() => CardEntity, (card) => card.assignee)
  public assignedCards = new Collection<CardEntity>(this);

  @ManyToMany(() => BoardEntity, (board) => board.members)
  public boards = new Collection<BoardEntity>(this);
}
