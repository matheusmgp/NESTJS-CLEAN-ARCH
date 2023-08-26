import { BaseEntity } from '@/shared/domain/entities/entity';
import { InMemorySearchableRepository } from '../../in-memory-searchable.repository';

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
    it('', () => {});
  });
  describe('applyPaginate method', () => {
    it('', () => {});
  });
  describe('search method', () => {
    it('', () => {});
  });
});
