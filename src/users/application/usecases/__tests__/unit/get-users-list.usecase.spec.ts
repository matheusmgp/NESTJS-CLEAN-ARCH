import { InMemoryUserRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { ListUsersUseCase } from '../../get-users-list.usecase';
import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('GetUsersListUseCase unit tests', () => {
  let repository: InMemoryUserRepository;
  let sut: ListUsersUseCase.UseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    sut = new ListUsersUseCase.UseCase(repository);
  });
  it('toOutput method', () => {
    let result = new IUserRepository.SearchResult({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
      sort: null,
      sortDir: null,
      filter: null,
    });
    let output = sut['toOutput'](result);
    expect(output).toStrictEqual({
      currentPage: 1,
      items: [],
      lastPage: 1,
      perPage: 2,
      total: 1,
    });

    const entity = new UserEntity(UserDataBuilder({}));
    result = new IUserRepository.SearchResult({
      items: [entity],
      total: 1,
      currentPage: 1,
      perPage: 2,
      sort: null,
      sortDir: null,
      filter: null,
    });
    output = sut['toOutput'](result);
    expect(output).toStrictEqual({
      currentPage: 1,
      items: [entity.toJSON()],
      lastPage: 1,
      perPage: 2,
      total: 1,
    });
  });
  it('should return users ordered by createAd desc', async () => {
    const createdAt = new Date();
    const items = [
      new UserEntity(UserDataBuilder({ createdAt })),
      new UserEntity(
        UserDataBuilder({ createdAt: new Date(createdAt.getTime() + 1) }),
      ),
    ];
    repository.items = items;
    const output = await sut.execute({});
    expect(output).toStrictEqual({
      currentPage: 1,
      items: [...items].reverse().map(item => item.toJSON()),
      lastPage: 1,
      perPage: 15,
      total: 2,
    });
  });
  it('should return users using pagination.sort and filter', async () => {
    const items = [
      new UserEntity(UserDataBuilder({ name: 'a' })),
      new UserEntity(UserDataBuilder({ name: 'AA' })),
      new UserEntity(UserDataBuilder({ name: 'Aa' })),
      new UserEntity(UserDataBuilder({ name: 'b' })),
      new UserEntity(UserDataBuilder({ name: 'c' })),
    ];
    repository.items = items;
    let output = await sut.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      currentPage: 1,
      items: [items[1].toJSON(), items[2].toJSON()],
      lastPage: 2,
      perPage: 2,
      total: 3,
    });
    output = await sut.execute({
      page: 2,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      currentPage: 2,
      items: [items[0].toJSON()],
      lastPage: 2,
      perPage: 2,
      total: 3,
    });
    output = await sut.execute({
      page: 3,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      currentPage: 3,
      items: [],
      lastPage: 2,
      perPage: 2,
      total: 3,
    });
    output = await sut.execute({
      page: 1,
      perPage: 3,
      sort: 'name',
      sortDir: 'desc',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      currentPage: 1,
      items: [items[0].toJSON(), items[2].toJSON(), items[1].toJSON()],
      lastPage: 1,
      perPage: 3,
      total: 3,
    });
  });
});
