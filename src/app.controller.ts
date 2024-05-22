import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';

import { FileInterceptor } from '@nest-lab/fastify-multer';

import { StorageService } from '@modules/firebase/services/storage.service';
import { Public }         from '@modules/auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.storageService.uploadImage('uploads', file);
  }
}
