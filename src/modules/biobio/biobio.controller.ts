import { Controller, Get } from '@nestjs/common';
import { BioBioService }   from '@modules/biobio/biobio.service';

@Controller('biobio')
export class BiobioController {

  constructor(private readonly _biobioService: BioBioService) {}

  @Get()
  async findLastNews() {
    return this._biobioService.findLastNews();
  }
}
