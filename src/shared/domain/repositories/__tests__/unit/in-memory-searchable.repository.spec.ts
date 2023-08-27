import { BaseEntity } from '@/shared/domain/entities/entity';
import { InMemorySearchableRepository } from '../../in-memory-searchable.repository';
import {
  SearchParams,
  SearchResult,
} from '../../searchable-repository-contracts';

type StubEntityProps = {
  name: string;
  price: number;
};
class StubEntity extends BaseEntity<StubEntityProps> {}

class StubInMemorySearchableRepository extends InMemorySearchableRepository<StubEntity> {
  sortableFields: string[] = ['name'];
  protected async applyFilter(
    items: StubEntity[],
    filter: string | null,
  ): Promise<StubEntity[]> {
    if (!filter) return items;

    return items.filter(item => {
      return item.props.name.toLowerCase().includes(filter.toLowerCase());
    });
  }
}

describe('InMemorySearchable Repository unit tests', () => {
  let sut: StubInMemorySearchableRepository;
  beforeEach(() => {
    sut = new StubInMemorySearchableRepository();
  });
  describe('applyFilter method', () => {
    it('should not filter when filter params is null', async () => {
      const items = [new StubEntity({ name: 'namevalue', price: 100 })];
      const spyFilterMethod = jest.spyOn(items, 'filter');
      const itemsFiltered = await sut['applyFilter'](items, null);
      expect(itemsFiltered).toStrictEqual(items);
      expect(spyFilterMethod).toHaveBeenCalledTimes(0);
    });
    it('should filter when filter params is not null', async () => {
      const items = [
        new StubEntity({ name: 'value1', price: 100 }),
        new StubEntity({ name: 'value2', price: 100 }),
        new StubEntity({ name: 'VALUE2', price: 100 }),
      ];
      const spyFilterMethod = jest.spyOn(items, 'filter');
      let itemsFiltered = await sut['applyFilter'](items, 'value2');
      expect(itemsFiltered).toStrictEqual([items[1], items[2]]);
      expect(spyFilterMethod).toHaveBeenCalled();

      itemsFiltered = await sut['applyFilter'](items, 'VALUE2');
      expect(itemsFiltered).toStrictEqual([items[1], items[2]]);
      expect(spyFilterMethod).toHaveBeenCalled();

      itemsFiltered = await sut['applyFilter'](items, 'noexisting');
      expect(itemsFiltered).toStrictEqual([]);
      expect(spyFilterMethod).toHaveBeenCalled();
    });
  });
  describe('applySort method', () => {
    it('should not sort the list passing null', async () => {
      const items = [
        new StubEntity({ name: 'a', price: 100 }),
        new StubEntity({ name: 'b', price: 100 }),
        new StubEntity({ name: 'c', price: 100 }),
      ];
      const itemsSorted = await sut['applySort'](items, null, null);
      expect(itemsSorted).toStrictEqual(items);
    });
    it('should sort the list desc and asc', async () => {
      const items = [
        new StubEntity({ name: 'a', price: 100 }),
        new StubEntity({ name: 'b', price: 100 }),
        new StubEntity({ name: 'c', price: 100 }),
      ];
      let itemsSorted = await sut['applySort'](items, 'name', 'desc');
      expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
      itemsSorted = await sut['applySort'](items, 'name', 'asc');
      expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
    });
  });
  describe('applyPaginate method', () => {
    it('should paginate items', async () => {
      const items = [
        new StubEntity({ name: 'a', price: 100 }),
        new StubEntity({ name: 'b', price: 100 }),
        new StubEntity({ name: 'c', price: 100 }),
        new StubEntity({ name: 'd', price: 100 }),
        new StubEntity({ name: 'e', price: 100 }),
      ];
      let itemsPaginated = await sut['applyPaginate'](items, 1, 2);
      expect(itemsPaginated).toStrictEqual([items[0], items[1]]);
      itemsPaginated = await sut['applyPaginate'](items, 2, 2);
      expect(itemsPaginated).toStrictEqual([items[2], items[3]]);
      itemsPaginated = await sut['applyPaginate'](items, 3, 2);
      expect(itemsPaginated).toStrictEqual([items[4]]);
      itemsPaginated = await sut['applyPaginate'](items, 4, 2);
      expect(itemsPaginated).toStrictEqual([]);
    });
  });
  describe('search method', () => {
    it('should search items with only pagination applied', async () => {
      const entity = new StubEntity({ name: 'test', price: 100 });
      const items = Array<StubEntity>(16).fill(entity);
      sut.items = items;

      const params = await sut.search(new SearchParams());
      expect(params).toStrictEqual(
        new SearchResult({
          items: Array<StubEntity>(15).fill(entity),
          total: 16,
          currentPage: 1,
          perPage: 15,
          sort: null,
          sortDir: null,
          filter: null,
        }),
      );
    });
    it('should search items with filter and  pagination applied', async () => {
      const items = [
        new StubEntity({ name: 'test', price: 50 }),
        new StubEntity({ name: 'a', price: 50 }),
        new StubEntity({ name: 'TEST', price: 50 }),
        new StubEntity({ name: 'TeSt', price: 50 }),
      ];
      sut.items = items;

      let params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          filter: 'TEST',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[0], items[2]],
          total: 3,
          currentPage: 1,
          perPage: 2,
          sort: null,
          sortDir: null,
          filter: 'TEST',
        }),
      );
      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          filter: 'TEST',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[3]],
          total: 3,
          currentPage: 2,
          perPage: 2,
          sort: null,
          sortDir: null,
          filter: 'TEST',
        }),
      );
    });
    it('should search items with filter ,sort and pagination applied', async () => {
      const items = [
        new StubEntity({ name: 'b', price: 50 }),
        new StubEntity({ name: 'a', price: 50 }),
        new StubEntity({ name: 'd', price: 50 }),
        new StubEntity({ name: 'e', price: 50 }),
        new StubEntity({ name: 'c', price: 50 }),
      ];
      sut.items = items;

      let params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[3], items[2]],
          total: 5,
          currentPage: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: null,
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[4], items[0]],
          total: 5,
          currentPage: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: null,
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[1], items[0]],
          total: 5,
          currentPage: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: null,
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[4], items[2]],
          total: 5,
          currentPage: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: null,
        }),
      );
    });
  });
});
