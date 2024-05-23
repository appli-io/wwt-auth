import { Injectable }  from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map }         from 'rxjs/operators';

@Injectable()
export class BioBioService {
  private readonly BIOBIO_URL = 'https://www.biobiochile.cl';

  constructor(private readonly _httpService: HttpService) {}

  findLastNews() {
    return this._httpService.get(`${ this.BIOBIO_URL }/static/news.json`)
      .pipe(map(response => response.data));
  }
}
