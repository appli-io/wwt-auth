import { Page, Pageable } from '../types';

export declare class PageableResponseDto<T extends object> implements Page<T> {
  readonly content: T[];
  readonly pageable: Pageable;
}
