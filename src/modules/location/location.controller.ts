import { Body, Controller, Post } from '@nestjs/common';
import { LocationService }        from '@modules/location/location.service';
import { CreateLocationDto }      from '@modules/location/dto/create-location.dto';

@Controller('location')
export class LocationController {

  constructor(private readonly locationService: LocationService) {}

  @Post()
  async create(@Body() dto: CreateLocationDto) {
    return this.locationService.create(dto);
  }
}
