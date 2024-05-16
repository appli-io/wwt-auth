import { Controller, Get } from '@nestjs/common';
import { StorageService }  from '@modules/firebase/services/storage.service';
import { Public }          from '@modules/auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get()
  async getFiles() {
    return await this.storageService.getFiles();
  }
}
