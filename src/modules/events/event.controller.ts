import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EventService }                                                 from './event.service';
import { EventQueryDto }                                                from './dtos/event-query.dto';
import { MemberGuard }                                                  from '@modules/auth/guards/member.guard';
import { RolesGuard }                                                   from '@modules/auth/guards/roles.guard';
import { CurrentUser }                                                  from '@modules/auth/decorators/current-user.decorator';
import { CurrentCompanyId }                                             from '@modules/company/decorators/company-id.decorator';
import { CreateEventDto }                                               from './dtos/create-event.dto';

@Controller('event')
@UseGuards(MemberGuard, RolesGuard)
export class EventController {
  constructor(private _eventService: EventService) {}

  @Get()
  public getEvents(
    @CurrentUser() user: string,
    @CurrentCompanyId() companyId: string,
    @Query() query: EventQueryDto
  ) {
    return this._eventService.findAll(query, companyId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: string,
    @CurrentCompanyId() companyId: string,
    @Param('id') id: string
  ) {
    return this._eventService.findOne(id);
  }

  @Post()
  public createEvent(
    @CurrentUser() user: string,
    @CurrentCompanyId() companyId: string,
    @Body() addEvent: CreateEventDto
  ) {
    return this._eventService.create(addEvent, user, companyId);
  }

  @Patch(':id')
  public updateEvent(
    @CurrentUser() user: string,
    @CurrentCompanyId() companyId: string,
    @Param('id') eventId: string,
    @Body() updateEvent: CreateEventDto
  ) {
    return this._eventService.update(eventId, updateEvent, companyId);
  }

  @Delete(':id')
  public deleteEvent(
    @CurrentUser() user: string,
    @CurrentCompanyId() companyId: string,
    @Param('id') eventId: string
  ) {
    return this._eventService.delete(eventId);
  }

}
