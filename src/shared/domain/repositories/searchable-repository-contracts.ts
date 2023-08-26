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

  constructor(props: SearchProps = {}) {
    this.page = props.page;
    this.perPage = props.perPage;
    this.sort = props.sort;
    this.sortDir = props.sortDir;
    this.filter = props.filter;
  }
  get page() {
    return this._page;
  }
  private set page(value: number) {
    const _page = +value;
    this._page = this.returnNumberValue(_page);
  }
  get perPage() {
    return this._perPage;
  }
  private set perPage(value: number) {
    this._perPage = this.returnNumberValuePerPage(value);
  }
  get sort() {
    return this._sort;
  }
  private set sort(value: string) {
    this._sort =
      value === null || value === undefined || value === '' ? null : `${value}`;
  }
  get sortDir() {
    return this._sortDir;
  }
  private set sortDir(value: string) {
    if (!this.sort) {
      this._sortDir = null;
      return;
    }
    const dir = `${value}`.toLowerCase();

    this._sortDir = dir != 'asc' && dir != 'desc' ? 'desc' : dir;
  }
  get filter() {
    return this._filter;
  }
  private set filter(value: string) {
    this._filter =
      value === null || value === undefined || value === '' ? null : `${value}`;
  }
  private returnNumberValue(value: number) {
    if (Number.isNaN(value) || value <= 0 || parseInt(value as any) != value)
      value = 1;
    return value;
  }
  private returnNumberValuePerPage(value: number) {
    let _perPage = value === (true as any) ? 15 : +value;
    if (
      Number.isNaN(_perPage) ||
      _perPage <= 0 ||
      parseInt(_perPage as any) != _perPage
    )
      _perPage = 15;
    return _perPage;
  }
}
export interface ISearchableRepository<
  E extends BaseEntity,
  SearchInput,
  SearchOutPut,
> extends IRepository<E> {
  search(props: SearchParams): Promise<SearchOutPut>;
}