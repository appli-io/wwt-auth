import { Page, Pageable } from '../types';
import { ApiProperty }    from '@nestjs/swagger';

export class PageableResponseDto<T extends object> implements Page<T> {
  @ApiProperty({
    description: 'The content of the page',
    isArray: true,
    type: Object,
  })
  readonly content: T[];

  @ApiProperty({
    description: 'The pageable details',
    type: Object,
    example: {
      'page': 1,
      'offset': 0,
      'size': 2,
      'unpaged': false,
      'totalPages': 5,
      'totalElements': 10,
      'sort': []
    }
  })
  readonly pageable: Pageable;
}
