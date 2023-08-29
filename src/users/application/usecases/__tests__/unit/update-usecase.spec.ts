import { InMemoryUserRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UpdateUserUseCase } from '../../update-user.usecase';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('UpdateUserUseCase unit tests', () => {
  let repository: InMemoryUserRepository;
  let sut: UpdateUserUseCase.UseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    sut = new UpdateUserUseCase.UseCase(repository);
  });
  it('should throw a NotFoundError exception when entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fake-id', name: 'test' }),
    ).rejects.toThrow(new NotFoundError(`Entity not found`));
  });
  it('should throw a BadRequestError exception when name is null', async () => {
    await expect(() =>
      sut.execute({ id: 'fake-id', name: null }),
    ).rejects.toThrow(new BadRequestError(`Name not provided`));
  });
  it('should throw a BadRequestError exception when name is empty', async () => {
    await expect(() =>
      sut.execute({ id: 'fake-id', name: '' }),
    ).rejects.toThrow(new BadRequestError(`Name not provided`));
  });
  it('should update the name of a UserEntity', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const items = [new UserEntity(UserDataBuilder({}))];
    repository.items = items;
    const result = await sut.execute({ id: items[0].id, name: 'updated' });
    expect(result).toMatchObject({
      id: items[0].id,
      name: 'updated',
      email: items[0].email,
      password: items[0].password,
      createdAt: items[0].createdAt,
    });
    expect(spyUpdate).toHaveBeenCalledTimes(1);
  });
});
