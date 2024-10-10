import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsString, IsUUID } from 'class-validator';
import { Transform }                from 'class-transformer';

import { UsersContactEntity } from '@modules/company-user/entities/users-contact.entity';
import { ContactTypeEnum }    from '@modules/users/enums/contact-type.enum';

export class ContactDto {
  public id: string;

  @ApiProperty({
    description: 'Value for the contact info',
    example: '+56 9 1234 5678 | email@email.com | social.account',
    type: String,
  })
  @IsString()
  public value!: string;

  @ApiProperty({
    description: 'Label for the contact info',
    example: 'Phone (ex: Personal) | Email (ex: Work) | Social Account (ex: Instagram)',
    type: String,
  })
  @IsString()
  public label!: string;

  @ApiProperty({
    description: 'Type of contact info',
    enum: ContactTypeEnum,
    example: 'email',
    type: String,
  })
  @IsEnum(ContactTypeEnum)
  @Transform(({value}) => value.toLowerCase())
  public type!: ContactTypeEnum;

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID()
  @IsString()
  public companyId!: string;

  public static fromEntity(entity: UsersContactEntity): ContactDto {
    return {
      id: entity.id,
      value: entity.value,
      label: entity.label,
      type: entity.type,
      companyId: entity.companyUser.company.id,
    };
  }
}
