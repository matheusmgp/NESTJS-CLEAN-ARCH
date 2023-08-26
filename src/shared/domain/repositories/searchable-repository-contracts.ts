import { BaseEntity } from '../entities/entity';
import { IRepository } from './repository-contracts';

export type SortDirection = 'asc' | 'desc';
export type SearchProps<Filter = string> = {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection | null;
  filter?: Filter;
};

export class SearchParams {
  protected _page: number;
  protected _perPage = 15;
  protected _sort: string | null;
  protected _sortDir: SortDirection | null;
  protected _filter: string | null;

  constructor(props: SearchProps) {
    this._page = props.page;
    this._perPage = props.perPage;
    this._sort = props.sort;
    this._sortDir = props.sortDir;
    this._filter = props.filter;
  }
  get page() {
    return this._page;
  }
  get perPage() {
    return this._perPage;
  }
  get sort() {
    return this._sort;
  }
  get sortDir() {
    return this._sortDir;
  }
  get filter() {
    return this._filter;
  }
}
export interface ISearchableRepository<
  E extends BaseEntity,
  SearchInput,
  SearchOutPut,
> extends IRepository<E> {
  search(props: SearchParams): Promise<SearchOutPut>;
}
