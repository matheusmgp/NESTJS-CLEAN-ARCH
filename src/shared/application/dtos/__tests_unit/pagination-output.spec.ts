import { PaginationOutputMapper } from '../pagination-output';
import { SearchResult } from '@/shared/domain/repositories/searchable-repository-contracts';

describe('PaginationOutputMapper unit tests', () => {
  it('Should convert to PaginationOutput type', () => {
    const result = new SearchResult({
      items: ['fake'] as any,
      total: 1,
      currentPage: 1,
      perPage: 1,
      sort: null,
      sortDir: null,
      filter: 'fake',
    });
    const sut = PaginationOutputMapper.toOutput(result.items, result);
    expect(sut).toStrictEqual({
      items: result.items,
      total: result.total,
      currentPage: result.currentPage,
      lastPage: result.lastPage,
      perPage: result.perPage,
    });
  });
});
