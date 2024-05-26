import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';

import { FileInterceptor } from '@nest-lab/fastify-multer';

import { CurrentUser }         from '@modules/auth/decorators/current-user.decorator';
import { MemberGuard }         from '@modules/auth/guards/member.guard';
import { CurrentCompanyId }    from '@modules/company/decorators/company-id.decorator';
import { QueryAlbumDto }       from '@modules/images/dtos/query-album.dto';
import { ImageService }        from '@modules/images/services/image.service';
import { QueryImagesDto }      from '@modules/images/dtos/query-images.dto';
import { ResponseImageMapper } from '@modules/images/mappers/response-image.mapper';
import { CreateAlbumDto }      from '../dtos/create-album.dto';
import { AlbumService }        from '../services/album.service';

@Controller('albums')
@UseGuards(MemberGuard)
export class AlbumController {
  constructor(
    private albumService: AlbumService,
    private imageService: ImageService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('cover'))
  async create(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @UploadedFile() cover: Express.Multer.File,
    @Body() createAlbumDto: CreateAlbumDto
  ) {
    return this.albumService.create(createAlbumDto, cover, companyId, userId);
  }

  @Get()
  async findAll(
    @CurrentCompanyId() companyId: string,
    @Body() query: QueryAlbumDto
  ) {
    return this.albumService.findAll(query, companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.albumService.findOne(id);
  }

  @Get(':id/images')
  async findImagesByAlbumId(
    @CurrentCompanyId() companyId: string,
    @Param('albumId', ParseUUIDPipe) albumId: string
  ) {
    const results = await this.imageService.findAll({albumId} as QueryImagesDto, companyId);

    return results.map(ResponseImageMapper.map);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.albumService.remove(id);
  }
}
