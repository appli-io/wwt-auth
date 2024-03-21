import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags }                     from '@nestjs/swagger';

import { CurrentUser }      from '@modules/auth/decorators/current-user.decorator';
import { CurrentCompanyId } from '@modules/company/decorators/company-id.decorator';
import { CreateNewsDto }    from '@modules/news/dtos/create-news.dto';
import { NewsService }      from '@modules/news/news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(
    private readonly _newsService: NewsService,
  ) {}

  @Get()
  public async findAll() {
    const news = await this._newsService.findAll();
    return news;
  }

  @Post()
  public async create(
    @CurrentUser() userId: number,
    @CurrentCompanyId() companyId: string,
    @Body() news: CreateNewsDto,
  ) {
    return this._newsService.create(news, userId, companyId);
  }
}
