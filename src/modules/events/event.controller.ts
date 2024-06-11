import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { EventQueryDto } from './dtos/event-query.dto';
import { MemberGuard } from '@modules/auth/guards/member.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { CurrentCompanyId } from '@modules/company/decorators/company-id.decorator';
import { CreateEventDto } from './dtos/create-event.dto';

@Controller('event')
@UseGuards(MemberGuard, RolesGuard)
export class EventController {
  constructor(private _eventService: EventService) {}

  @Get()
  public async getEvents(@CurrentUser()
    user: string,
    @CurrentCompanyId() companyId: string,
    @Query() query: EventQueryDto) 
    {
    return await this._eventService.findAll(query, companyId);
  }

  @Post()
  public async createEvent(@CurrentUser() 
    user: string,
    @CurrentCompanyId() companyId: string,
    @Body() addEvent: CreateEventDto) 
    {
    return await this._eventService.create(addEvent,user,companyId);
  }

  @Delete(':id')
  public async deleteEvent(@CurrentUser() 
    user: string,
    @CurrentCompanyId() companyId: string,
    @Param('id') eventId: string) 
    {
    return await this._eventService.delete(eventId);
  }
  
}
