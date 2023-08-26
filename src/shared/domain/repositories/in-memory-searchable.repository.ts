import { BaseEntity } from '../entities/entity';
import { InMemoryRepository } from './in-memory.repository';
import { ISearchableRepository } from './searchable-repository-contracts';

export abstract class InMemorySearchableRepository<E extends BaseEntity>
  extends InMemoryRepository<E>
  implements ISearchableRepository<E, any, any>
{
  search(props: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
