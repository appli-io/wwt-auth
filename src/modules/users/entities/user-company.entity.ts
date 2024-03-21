import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { UserEntity }                        from '@modules/users/entities/user.entity';
import { CompanyEntity }                     from '@modules/company/entities/company.entity';

@Entity({tableName: 'user_company'})
export class UserCompanyEntity {
  @ManyToOne({primary: true, entity: () => UserEntity})
  public user: UserEntity;

  @ManyToOne({primary: true, entity: () => CompanyEntity})
  public company: CompanyEntity;

  @Property({columnType: 'boolean', default: true})
  public active: boolean;

  @Enum({items: () => [ 'EMPLOYEE', 'ADMIN' ], default: 'EMPLOYEE'})
  public role: 'EMPLOYEE' | 'ADMIN';

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt?: Date;
}
