import { PaginationPresenter } from '@/shared/infrastructure/presenters/pagination.presenter';
import { UserCollectionPresenter, UserPresenter } from '../../user.presenter';
import { instanceToPlain } from 'class-transformer';
describe('UserPreseter unit test', () => {
  let sut: UserPresenter;
  const createdAt = new Date();
  const props = {
    id: '9493d827-e914-447d-bec7-767cffd246db',
    name: 'test name',
    email: 'e@e.com',
    password: '1234',
    createdAt,
  };
  beforeEach(() => {
    sut = new UserPresenter(props);
  });
  describe('Constructor unit test', () => {
    it('should define all fields', () => {
      expect(sut.id).toEqual(props.id);
      expect(sut.name).toEqual(props.name);
      expect(sut.email).toEqual(props.email);
      expect(sut.createdAt).toEqual(props.createdAt);
    });
  });

  it('should presente the data', () => {
    const output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      id: '9493d827-e914-447d-bec7-767cffd246db',
      name: 'test name',
      email: 'e@e.com',
      createdAt: createdAt.toISOString(),
    });
  });
});

describe('UserCollectionPreseter unit test', () => {
  const createdAt = new Date();
  const props = {
    id: '9493d827-e914-447d-bec7-767cffd246db',
    name: 'test name',
    email: 'e@e.com',
    password: '1234',
    createdAt,
  };

  describe('Constructor unit test', () => {
    const sut = new UserCollectionPresenter({
      items: [props],
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 1,
    });
    it('should define all fields', () => {
      expect(sut.meta).toBeInstanceOf(PaginationPresenter);
      expect(sut.meta).toStrictEqual(
        new PaginationPresenter({
          currentPage: 1,
          perPage: 2,
          lastPage: 1,
          total: 1,
        }),
      );
      expect(sut.data).toStrictEqual([new UserPresenter(props)]);
    });
  });

  it('should presente the data', () => {
    let sut = new UserCollectionPresenter({
      items: [props],
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 1,
    });
    let output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      data: [
        {
          id: '9493d827-e914-447d-bec7-767cffd246db',
          name: 'test name',
          email: 'e@e.com',
          createdAt: createdAt.toISOString(),
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      },
    });

    sut = new UserCollectionPresenter({
      items: [props],
      currentPage: '1' as any,
      perPage: '2' as any,
      lastPage: '1' as any,
      total: '1' as any,
    });
    output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      data: [
        {
          id: '9493d827-e914-447d-bec7-767cffd246db',
          name: 'test name',
          email: 'e@e.com',
          createdAt: createdAt.toISOString(),
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      },
    });
  });
});
