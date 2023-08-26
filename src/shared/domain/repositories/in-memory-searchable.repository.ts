import { BaseEntity } from '../entities/entity';
import { InMemoryRepository } from './in-memory.repository';
import {
  ISearchableRepository,
  SearchParams,
  SearchResult,
} from './searchable-repository-contracts';

export abstract class InMemorySearchableRepository<E extends BaseEntity>
  extends InMemoryRepository<E>
  implements ISearchableRepository<E, any, any>
{
  async search(props: SearchParams): Promise<SearchResult<E>> {
    const itemsFiltered = await this.applyFilter(this.items, props.filter);
    const itemsSorted = await this.applySort(
      this.items,
      props.sort,
      props.sortDir,
    );
    const itemsPaginated = await this.applyPaginate(
      itemsSorted,
      props.page,
      props.perPage,
    );

    return new SearchResult({
      items: itemsPaginated,
      total: itemsFiltered.length,
      currentPage: props.page,
      perPage: props.perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: string | null,
  ): Promise<E[]>;

  protected async applySort(
    items: E[],
    sort: string | null,
    sortDir: string | null,
  ): Promise<E[]> {}
  protected async applyPaginate(
    items: E[],
    page: SearchParams['page'],
    perPage: SearchParams['perPage'],
  ): Promise<E[]> {}
}
