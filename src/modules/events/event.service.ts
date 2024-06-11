import { BadRequestException, Injectable } from "@nestjs/common";
import { EventEntity } from "./entities/event.entity";
import { EventQueryDto } from "./dtos/event-query.dto";
import { QBFilterQuery } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { CreateEventDto } from './dtos/create-event.dto';
import { v4 } from "uuid";
import { CommonService } from "@common/common.service";

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
    const user = userId;
    const company = companyId;
    const eventId: string = v4();

    const event: EventEntity = this._eventRepository.create({
      ...createEventDto,
      id: eventId,
      company: company,
      createdBy: user,
    });


    try {
      await this._commonService.saveEntity(event, true);
      return event;
    } catch (error) {
      throw new BadRequestException('Failed to create event due to a database error');
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
