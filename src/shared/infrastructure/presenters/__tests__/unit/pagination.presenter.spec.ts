import { instanceToPlain } from 'class-transformer';
import { PaginationPresenter } from '../../pagination.presenter';
describe('PaginationPresenter unit test', () => {
  describe('Constructor unit test', () => {
    it('should define all fields', () => {
      const props = {
        perPage: 2,
        currentPage: 1,
        lastPage: 3,
        total: 4,
      };
      const sut = new PaginationPresenter(props);
      expect(sut.perPage).toEqual(props.perPage);
      expect(sut.currentPage).toEqual(props.currentPage);
      expect(sut.lastPage).toEqual(props.lastPage);
      expect(sut.total).toEqual(props.total);
    });
    it('should set string values', () => {
      const props = {
        perPage: '2' as any,
        currentPage: '1' as any,
        lastPage: '3' as any,
        total: '4' as any,
      };
      const sut = new PaginationPresenter(props);
      expect(sut.perPage).toEqual('2');
      expect(sut.currentPage).toEqual('1');
      expect(sut.lastPage).toEqual('3');
      expect(sut.total).toEqual('4');
    });
  });

  it('should presente the data', () => {
    let sut = new PaginationPresenter({
      perPage: 2,
      currentPage: 1,
      lastPage: 3,
      total: 4,
    });
    let output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      perPage: 2,
      currentPage: 1,
      lastPage: 3,
      total: 4,
    });
    sut = new PaginationPresenter({
      perPage: '2' as any,
      currentPage: '1' as any,
      lastPage: '3' as any,
      total: '4' as any,
    });
    output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      perPage: 2,
      currentPage: 1,
      lastPage: 3,
      total: 4,
    });
  });
});
