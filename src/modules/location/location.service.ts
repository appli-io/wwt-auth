import { Injectable }       from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

import { AdministrativeUnitEntity } from '@modules/location/entities/administrative-unit.entity';
import { CreateLocationDto }        from '@modules/location/dto/create-location.dto';

@Injectable()
export class LocationService {

  constructor(
    @InjectRepository(AdministrativeUnitEntity) private readonly administrativeUnitRepository: EntityRepository<AdministrativeUnitEntity>
  ) {}

  create(dto: CreateLocationDto) {

  }
}
