import { InMemoryUserRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { GetUserUseCase } from '../../getuser.usecase';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('GetUserUseCase unit tests', () => {
  let repository: InMemoryUserRepository;
  let sut: GetUserUseCase.UseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    sut = new GetUserUseCase.UseCase(repository);
  });
  it('should throw a NotFoundError exception when entity not found', async () => {
    await expect(() => sut.execute({ id: 'fake-id' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
  it('should return a UserEntity', async () => {
    const spyFindById = jest.spyOn(repository, 'findById');
    const items = [new UserEntity(UserDataBuilder({}))];
    repository.items = items;
    const result = await sut.execute({ id: items[0].id });
    expect(spyFindById).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      id: items[0].id,
      name: items[0].name,
      email: items[0].email,
      password: items[0].password,
      createdAt: items[0].createdAt,
    });
  });
});
