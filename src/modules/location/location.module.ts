import { Module }                   from '@nestjs/common';
import { MikroOrmModule }           from '@mikro-orm/nestjs';
import { AdministrativeUnitEntity } from '@modules/location/entities/administrative-unit.entity';
import { LocationController }       from './location.controller';
import { LocationService }          from './location.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([ AdministrativeUnitEntity ])
  ],
  controllers: [ LocationController ],
  providers: [ LocationService ]
})
export class LocationModule {}
