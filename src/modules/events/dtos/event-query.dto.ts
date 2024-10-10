import { ApiProperty } from "@nestjs/swagger";
import { Enum } from "@mikro-orm/core";
import { EventTypeEnum } from "../enums/event-type.enum";
import { EventStatusEnum } from "../enums/event-status.enum";

export class EventQueryDto {
  @ApiProperty({
    description: 'Event ID',
    type: String
  })
  id?: string;
  @ApiProperty({
    description: 'Event title',
    type: String
  })
  title?: string;
  
  @ApiProperty({
    description: 'Event is all day',
    type: Boolean
  })
  isAllDay?: boolean;

  @ApiProperty({
    description: 'Event start date',
    type: Date
  })
  startDate?: Date;

  @ApiProperty({
    description: 'Event end date',
    type: Date
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Event location',
    type: String
  })
  location?: string;

  @ApiProperty({
    description: 'Event capacity',
    type: Number
  })
  capacity?: number;

  @ApiProperty({
    description: 'Event type',
    example: 'news',
    type: String,
    enum: EventTypeEnum
  })
  @Enum(() => EventTypeEnum)
  type?: EventTypeEnum;

  @ApiProperty({
    description: 'Event status',
    type: String,
    enum: EventStatusEnum
  })
  @Enum(() => EventStatusEnum)
  status?: EventStatusEnum;

  @ApiProperty({
    description: 'Event created by user ID',
    type: String
  })
  createdBy?: string;

}
