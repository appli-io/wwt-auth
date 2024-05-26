import { Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AlbumService }                                                        from '../services/album.service';
import { CreateAlbumDto }                                                      from '../dtos/create-album.dto';
import { CurrentUser }                                                         from '@modules/auth/decorators/current-user.decorator';
import { CurrentCompanyId }                                                    from '@modules/company/decorators/company-id.decorator';
import { FileInterceptor }                                                     from '@nest-lab/fastify-multer';

@Controller('albums')

export class AlbumController {
  constructor(private albumService: AlbumService) {}

  @Post()
  @UseInterceptors(FileInterceptor('coverPhoto'))
  async create(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @UploadedFile() coverPhoto: Express.Multer.File,
    createAlbumDto: CreateAlbumDto
  ) {
    return this.albumService.create(createAlbumDto, coverPhoto, companyId, userId);
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
