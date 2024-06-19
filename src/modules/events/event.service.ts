import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEntity }                     from './entities/event.entity';
import { EventQueryDto }                   from './dtos/event-query.dto';
import { QBFilterQuery }                   from '@mikro-orm/core';
import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityRepository }                from '@mikro-orm/postgresql';
import { CreateEventDto }                  from './dtos/create-event.dto';
import { CommonService }                   from '@common/common.service';
import { getCoordinates }                  from '@lib/gmap-extract-lat-long';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity) private readonly _eventRepository: EntityRepository<EventEntity>,
    private readonly _commonService: CommonService,
  ) {}

  public async findAll(query: EventQueryDto, companyId: string) {
    const whereClause: QBFilterQuery<EventEntity> = {company: {id: companyId}};
    
    if (query.id) whereClause['id'] = { $eq: query.id };
    if (query.title) whereClause['title'] = { $ilike: `%${query.title}%` };
    if (query.isAllDay) whereClause['isAllDay'] = query.isAllDay;
    if (query.startDate) whereClause['startDate'] = query.startDate;
    if (query.endDate) whereClause['endDate'] = query.endDate;
    if (query.location) whereClause['location'] = { $ilike: `%${query.location}%` };
    //capacity
    if (query.type) whereClause['type'] = query.type;
    if (query.status) whereClause['status'] = query.status;

    return this._eventRepository.findAll({where: whereClause });
  }


  public async create(createEventDto: CreateEventDto, userId: string, companyId: string): Promise<EventEntity>{
    const event: EventEntity = this._eventRepository.create({
      ...createEventDto,
      company: companyId,
      createdBy: userId,
    });

    if (event.url?.some(url => url.platform === 'maps')) {
      await Promise.all(
        event.url.map(async url => {
          if (url.platform === 'maps' && url.url) {
            const {lat, lng} = await getCoordinates(url.url);
            url.latitude = lat;
            url.longitude = lng;
          }

          return url;
        })
      );
    }

    try {
      await this._commonService.saveEntity(event, true);
      return event;
    } catch (error) {
      throw new BadRequestException('Failed to create event due to a database error: ' + error.message);
    }
    
  }

  public async delete(
    id: string, 
    ): Promise<void> {
    const event = await this._eventRepository.findOne({id});
    if (!event) throw new BadRequestException('Event not found');

    await this._commonService.removeEntity(event);
}
}
