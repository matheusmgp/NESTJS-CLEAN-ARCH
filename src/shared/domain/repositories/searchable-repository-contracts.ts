import { BaseEntity } from '../entities/entity';
import { IRepository } from './repository-contracts';

export interface ISearchableRepository<
  E extends BaseEntity,
  SearchInput,
  SearchOutPut,
> extends IRepository<E> {
  search(props: SearchInput): Promise<SearchOutPut>;
}
