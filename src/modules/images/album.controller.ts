import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Scope,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';

import { FileInterceptor, FilesInterceptor } from '@nest-lab/fastify-multer';

import { CurrentUser }      from '@modules/auth/decorators/current-user.decorator';
import { MemberGuard }      from '@modules/auth/guards/member.guard';
import { CurrentCompanyId } from '@modules/company/decorators/company-id.decorator';

import { CreateAlbumDto }        from './dtos/create-album.dto';
import { QueryAlbumDto }         from './dtos/query-album.dto';
import { QueryImagesDto }        from './dtos/query-images.dto';
import { ImageEntity }           from './entities/image.entity';
import { ResponseImageMapper }   from './mappers/response-image.mapper';
import { ResponseAlbumMapper }   from './mappers/response-album.mapper';
import { ResponseAlbumsMapper }  from './mappers/response-albums.mapper';
import { AlbumService }          from './services/album.service';
import { ImageService }          from './services/image.service';
import { VALID_IMAGE_TYPES }     from '@common/constant';
import { removeUndefinedFields } from '@common/utils/functions.util';

@Controller({
  path: 'albums',
  scope: Scope.REQUEST
})
@UseGuards(MemberGuard)
export class AlbumController {
  constructor(
    private albumService: AlbumService,
    private imageService: ImageService
  ) {}

  @Get()
  async findAll(
    @CurrentCompanyId() companyId: string,
    @Body() query: QueryAlbumDto
  ) {
    const results = await this.albumService.findAll(query, companyId);

    return results.map(ResponseAlbumsMapper.map);
  }

  @Get(':id')
  async findOne(
    @CurrentCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const album = await this.albumService.findOne(id, companyId);

    if (!album) throw new NotFoundException('ALBUM_NOT_FOUND');

    return ResponseAlbumMapper.map(album);
  }

  @Post()
  @UseInterceptors(FileInterceptor('cover', {
    fileFilter: (req, file, cb) => {
      if (!VALID_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('INVALID_IMAGE_TYPE'), false);
      }

      cb(null, true);
    }
  }))
  async create(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @UploadedFile() cover: Express.Multer.File,
    @Body() createAlbumDto: CreateAlbumDto
  ) {
    return this.albumService.create(createAlbumDto, cover, companyId, userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('cover', {
    fileFilter: (req, file, cb) => {
      if (!VALID_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('INVALID_IMAGE_TYPE'), false);
      }

      cb(null, true);
    }
  }))
  async update(
    @CurrentCompanyId() companyId: string,
    @Param('id') id: string,
    @UploadedFile() cover: Express.Multer.File,
    @Body() updateAlbumDto: any
  ) {
    removeUndefinedFields(updateAlbumDto);

    return this.albumService.update(id, updateAlbumDto, cover, companyId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.albumService.remove(id);
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
  @UseInterceptors(FilesInterceptor('images', undefined, {
    fileFilter: (req, file, cb) => {
      if (!VALID_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('INVALID_IMAGE_TYPE'), false);
      }

      cb(null, true);
    }
  }))
  async uploadImages(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @UploadedFiles() images: Express.Multer.File[],
    @Param('id', ParseUUIDPipe) albumId: string
  ): Promise<ImageEntity[]> {
    const album = await this.albumService.findOne(albumId, companyId);

    if (!images || images.length === 0) throw new BadRequestException('NO_IMAGES');
    if (!album) throw new NotFoundException('ALBUM_NOT_FOUND');

    return this.imageService.create(albumId, images, companyId, userId);
  }

  @Get(':id/images/:imageId')
  async imageFindOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }

  @Delete(':id/images/:imageId')
  async imageRemove(@Param('imageId') id: string) {
    return this.imageService.remove(id);
  }
}
