import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IsEnum }                                        from 'class-validator';
import { v4 }                                            from 'uuid';

import { CompanyEntity }   from '@modules/company/entities/company.entity';
import { EventTypeEnum }   from '@modules/events/enums/event-type.enum';
import { EventStatusEnum } from '@modules/events/enums/event-status.enum';
import { IEventUrl }       from '@modules/events/interfaces/event-url.interface';
import { IEventOrganizer } from '@modules/events/interfaces/event-organizer.interface';
import { UserEntity }      from '@modules/users/entities/user.entity';

@Entity({tableName: 'events'})
export class EventEntity {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

  @Property({columnType: 'text'})
  public title: string;

  @Property({columnType: 'text'})
  public description: string;

  @Property({columnType: 'timestamptz'})
  public startDate: Date;

  @Property({columnType: 'timestamptz'})
  public endDate: Date;

  @Property({columnType: 'text'})
  public location: string;

  @Property({columnType: 'json'})
  public url: IEventUrl[];

  @Property({columnType: 'text'})
  public image: string;

  @Property({columnType: 'int'})
  public capacity: number;

  @Property({columnType: 'json'})
  public organizer: IEventOrganizer;

  @Enum({
    items: () => EventTypeEnum,
    default: EventTypeEnum.MEETUP,
  })
  @IsEnum(EventTypeEnum)
  public type: EventTypeEnum;

  @Enum({
    items: () => EventStatusEnum,
    default: EventStatusEnum.DRAFT,
  })
  @IsEnum(EventStatusEnum)
  public status: EventStatusEnum;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date()})
  public updatedAt: Date = new Date();

  @ManyToOne({entity: () => UserEntity, nullable: false})
  public createdBy: UserEntity;

  @ManyToOne({entity: () => CompanyEntity, nullable: false})
  public company: CompanyEntity;
}
