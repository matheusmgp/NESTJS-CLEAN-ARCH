import { instanceToPlain } from 'class-transformer';
import { PaginationPresenter } from '../../pagination.presenter';
import { CollectionPresenter } from '../../collection.presenter';

class StubCollectionPresenter extends CollectionPresenter {
  data = [1, 2, 3];
}
describe('CollectionPresenter unit test', () => {
  let sut: StubCollectionPresenter;

  beforeEach(() => {
    sut = new StubCollectionPresenter({
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
      total: 4,
    });
  });
  describe('Constructor unit test', () => {
    it('should define all fields', () => {
      expect(sut['paginationPresenter']).toBeInstanceOf(PaginationPresenter);
      expect(sut['paginationPresenter'].currentPage).toBe(1);
      expect(sut['paginationPresenter'].perPage).toBe(2);
      expect(sut['paginationPresenter'].lastPage).toBe(2);
      expect(sut['paginationPresenter'].total).toBe(4);
    });
  });

  it('should presente the data', () => {
    const output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      data: [1, 2, 3],
      meta: { currentPage: 1, perPage: 2, lastPage: 2, total: 4 },
    });
  });
});
