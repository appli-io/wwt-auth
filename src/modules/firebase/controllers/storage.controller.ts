import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor }                                       from '@nest-lab/fastify-multer';

import { StorageService }   from '@modules/firebase/services/storage.service';
import { UploadOptionsDto } from '@modules/firebase/dtos/upload-options.dto';
import { CurrentCompanyId } from '@modules/company/decorators/company-id.decorator';

@Controller('firebase/storage')
export class StorageController {
  constructor(private readonly _storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentCompanyId() companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadOptions: UploadOptionsDto
  ) {
    return await this._storageService.uploadFile(file, uploadOptions, companyId);
  }
}
