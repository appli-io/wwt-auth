import { ApiProperty } from '@nestjs/swagger';

import { Allow, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, Length, Min, MinLength } from 'class-validator';
import { Transform, Type }                                                                          from 'class-transformer';

import { EventTypeEnum }   from '../enums/event-type.enum';
import { EventStatusEnum } from '../enums/event-status.enum';
import { IEventUrl }       from '../interfaces/event-url.interface';
import { IEventOrganizer } from '../interfaces/event-organizer.interface';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title',
    type: String
  })
  @IsString()
  @Length(3, 100)
  public title: string;

  @ApiProperty({
    description: 'Event description',
  })
  @IsString()
  @MinLength(10)
  public description: string;

  @ApiProperty({
    description: 'Event is all day',
    type: Boolean
  })
  @IsBoolean()
  public isAllDay: boolean;

  @ApiProperty({
    description: 'Event start date',
    type: Date
  })
  @Type(() => Date)
  @IsDate()
  public startDate: Date;

  @ApiProperty({
    description: 'Event end date',
    type: Date
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  public endDate?: Date;

  @ApiProperty({
    description: 'Event location',
    type: String
  })
  @IsString()
  @Length(3, 255)
  public location: string;

  @ApiProperty({
    description: 'Event url',
    type: String
  })
  @IsOptional()
  public url: IEventUrl[];

  @ApiProperty({
    description: 'Event image',
    type: String
  })
  @IsString()
  @IsOptional()
  public image: string;

  @ApiProperty({
    description: 'Event capacity',
    type: Number
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  public capacity: number;

  @ApiProperty({
    description: 'Event organizer',
    type: String
  })
  @Allow()
  public organizer: IEventOrganizer;

  @ApiProperty({
    description: 'Event type',
    type: String,
    enum: EventTypeEnum
  })
  @Transform(({value}) => value.toLowerCase())
  @IsEnum(EventTypeEnum)
  public type: EventTypeEnum;

  @ApiProperty({
    description: 'Event status',
    type: String,
    enum: EventStatusEnum
  })
  @Transform(({value}) => value.toLowerCase())
  @IsEnum(EventStatusEnum)
  public status: EventStatusEnum;
}
