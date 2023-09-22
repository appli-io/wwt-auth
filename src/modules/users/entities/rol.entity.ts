import { IRol }                         from '@modules/users/interfaces/rol.interface';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { IsString, Length, Matches }    from 'class-validator';
import { NAME_REGEX }                   from '@common/consts/regex.const';

@Entity({tableName: 'rol'})
export class RolEntity implements IRol {
  @PrimaryKey()
  public id: number;

  @Property({columnType: 'varchar', length: 100})
  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Name must not have special characters',
  })
  public name: string;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @Length(3, 255)
  public description: string;

  @Property({onCreate: () => new Date()})
  public createdAt: Date;

  @Property({onUpdate: () => new Date()})
  public updatedAt: Date;
}
