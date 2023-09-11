import { EntityRepository } from '@mikro-orm/postgresql';
import { EntityMock }       from './entity.mock';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class EntityRepositoryMock implements EntityRepository<EntityMock> {
  persist = jest.fn();
  flush = jest.fn();
  removeAndFlush = jest.fn();
}
