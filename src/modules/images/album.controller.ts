import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AlbumService }                               from './album.service';
import { CreateAlbumDto }                             from './dtos/create-album.dto';

@Controller('albums')

export class AlbumController {
  constructor(private albumService: AlbumService) {}

  @Post()
  async create(@Body() createAlbumDto: CreateAlbumDto) {
    return this.albumService.create(createAlbumDto);
  }

  @Get()
  async findAll() {
    return this.albumService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.albumService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.albumService.remove(id);
  }
}
