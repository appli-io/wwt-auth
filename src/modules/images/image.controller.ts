import { Body, Controller, Delete, Get, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';

import { FilesInterceptor } from '@nest-lab/fastify-multer';

import { CurrentUser }      from '@modules/auth/decorators/current-user.decorator';
import { MemberGuard }      from '@modules/auth/guards/member.guard';
import { CurrentCompanyId } from '@modules/company/decorators/company-id.decorator';
import { CreateImageDto }   from '@modules/images/dtos/create-image.dto';
import { ImageEntity }      from '@modules/images/entities/image.entity';
import { ImageService }     from './image.service';

@Controller('images')
@UseGuards(MemberGuard)
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createImageDto: CreateImageDto
  ): Promise<ImageEntity[]> {
    return this.imageService.create(createImageDto, files, companyId, userId);
  }

  @Get()
  async findAll() {
    return this.imageService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.imageService.remove(id);
  }
}
