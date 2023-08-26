import { SearchParams } from '../../searchable-repository-contracts';

describe('Searchable Repository unit tests', () => {
  describe('SearchParams unit tests', () => {
    it('page prop', () => {
      const sut = new SearchParams();
      expect(sut.page).toBe(1);
      const params = [
        { page: null as any, expected: 1 },
        { page: undefined as any, expected: 1 },
        { page: '' as any, expected: 1 },
        { page: 'random' as any, expected: 1 },
        { page: 0 as any, expected: 1 },
        { page: -1 as any, expected: 1 },
        { page: 5.5 as any, expected: 1 },
        { page: true as any, expected: 1 },
        { page: false as any, expected: 1 },
        { page: {} as any, expected: 1 },
        { page: 1, expected: 1 },
        { page: 2, expected: 2 },
      ];
      params.forEach(i => {
        expect(new SearchParams({ page: i.page }).page).toBe(i.expected);
      });
    });
    it('perPage prop', () => {
      const sut = new SearchParams();
      expect(sut.perPage).toBe(15);
      const params = [
        { perPage: null as any, expected: 15 },
        { perPage: undefined as any, expected: 15 },
        { perPage: '' as any, expected: 15 },
        { perPage: 'random' as any, expected: 15 },
        { perPage: 0 as any, expected: 15 },
        { perPage: -1 as any, expected: 15 },
        { perPage: 5.5 as any, expected: 15 },
        { perPage: true as any, expected: 15 },
        { perPage: false as any, expected: 15 },
        { perPage: {} as any, expected: 15 },
        { perPage: 1, expected: 1 },
        { perPage: 2, expected: 2 },
      ];
      params.forEach(i => {
        expect(new SearchParams({ perPage: i.perPage }).perPage).toBe(
          i.expected,
        );
      });
    });
    it('sort prop', () => {
      const sut = new SearchParams();
      expect(sut.sort).toBe(null);
      const params = [
        { sort: null as any, expected: null },
        { sort: undefined as any, expected: null },
        { sort: '' as any, expected: null },
        { sort: 'myfilter', expected: 'myfilter' },
        { sort: 0, expected: '0' },
        { sort: -1, expected: '-1' },
        { sort: 5.5 as any, expected: '5.5' },
        { sort: true as any, expected: 'true' },
        { sort: false as any, expected: 'false' },
        { sort: {} as any, expected: '[object Object]' },
        { sort: 1, expected: '1' },
        { sort: 2, expected: '2' },
      ];
      params.forEach(i => {
        expect(new SearchParams({ sort: i.sort }).sort).toBe(i.expected);
      });
    });
    it('sortDir prop', () => {
      let sut = new SearchParams();
      expect(sut.sortDir).toBe(null);

      sut = new SearchParams({ sort: null });
      expect(sut.sortDir).toBe(null);

      sut = new SearchParams({ sort: undefined });
      expect(sut.sortDir).toBe(null);

      sut = new SearchParams({ sort: '' });
      expect(sut.sortDir).toBe(null);

      const params = [
        { sortDir: null as any, expected: 'desc' },
        { sortDir: undefined as any, expected: 'desc' },
        { sortDir: '' as any, expected: 'desc' },
        { sortDir: 'asc', expected: 'asc' },
        { sortDir: 'desc', expected: 'desc' },
        { sortDir: 'wrongfilter', expected: 'desc' },
        { sortDir: 'WRONGFILTER', expected: 'desc' },
        { sortDir: 'ASC', expected: 'asc' },
        { sortDir: 'DESC', expected: 'desc' },
      ];
      params.forEach(i => {
        expect(
          new SearchParams({ sort: 'field', sortDir: i.sortDir }).sortDir,
        ).toBe(i.expected);
      });
    });
  });
});
