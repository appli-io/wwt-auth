import { CompanyEntity }                                 from '@modules/company/entities/company.entity';
import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { RoleEnum }                                      from '../enums/role.enum';
import { UserEntity }                                    from '@modules/users/entities/user.entity';
import { v4 }                                            from 'uuid';

@Entity({ tableName: 'company_user_invite' })
export class CompanyUserInviteEntity {
  @PrimaryKey({ columnType: 'uuid' })
  public id: string = v4();

  @Property({ columnType: 'varchar' })
  public email: string;

  @Enum({ items: () => RoleEnum, default: RoleEnum.USER })
  public role: RoleEnum;

  @Property({columnType: 'varchar'})
  public position: string;

  @Property({ columnType: 'text' })
  public message: string;

  @Property({columnType: 'varchar', nullable: false})
  public token: string;

  @Property({ columnType: 'boolean', default: false })
  public joined: boolean;

  @Property({ columnType: 'timestamptz', onCreate: () => new Date() })
  public createdAt: Date;

  @Property({ columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true })
  public updatedAt?: Date;

  @ManyToOne({ entity: () => CompanyEntity })
  public company: CompanyEntity;

  @ManyToOne({entity: () => UserEntity})
  public createdBy: UserEntity;
}
