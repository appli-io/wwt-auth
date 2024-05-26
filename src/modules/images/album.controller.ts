import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';

import { FileInterceptor, FilesInterceptor } from '@nest-lab/fastify-multer';

import { CurrentUser }         from '@modules/auth/decorators/current-user.decorator';
import { MemberGuard }         from '@modules/auth/guards/member.guard';
import { CurrentCompanyId }    from '@modules/company/decorators/company-id.decorator';
import { QueryAlbumDto }       from '@modules/images/dtos/query-album.dto';
import { QueryImagesDto }      from '@modules/images/dtos/query-images.dto';
import { ImageEntity }         from '@modules/images/entities/image.entity';
import { ImageService }        from '@modules/images/services/image.service';
import { ResponseImageMapper } from '@modules/images/mappers/response-image.mapper';
import { CreateAlbumDto }      from './dtos/create-album.dto';
import { AlbumService }        from './services/album.service';

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
  async findOne(
    @CurrentCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.albumService.findOne(id, companyId);
  }

  @Get(':id/images')
  async findImagesByAlbumId(
    @CurrentCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) albumId: string
  ) {
    const results = await this.imageService.findAll({albumId} as QueryImagesDto, companyId);

    return results.map(ResponseImageMapper.map);
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImages(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @UploadedFiles() images: Express.Multer.File[],
    @Param('id', ParseUUIDPipe) albumId: string
  ): Promise<ImageEntity[]> {
    const album = await this.albumService.findOne(albumId, companyId);

    if (!album) throw new NotFoundException('ALBUM_NOT_FOUND');

    return this.imageService.create(albumId, images, companyId, userId);
  }

  @Get(':id/images/:imageId')
  async imageFindOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }

  @Delete(':id/images/:imageId')
  async imageRemove(@Param('id') id: string) {
    return this.imageService.remove(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.albumService.remove(id);
  }
}
