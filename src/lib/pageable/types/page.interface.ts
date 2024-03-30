import { Pageable } from '@lib/pageable';

export interface Page<T extends object> {
  content: T[];
  pageable: Pageable;
}
