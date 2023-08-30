import { InMemoryUserRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { DeleteUserUseCase } from '../../deleteuser.usecase';

describe('DeleteUserUseCase unit tests', () => {
  let repository: InMemoryUserRepository;
  let sut: DeleteUserUseCase.UseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    sut = new DeleteUserUseCase.UseCase(repository);
  });
  it('should throw a NotFoundError exception when entity not found', async () => {
    await expect(() => sut.execute({ id: 'fake-id' })).rejects.toThrow(
      new NotFoundError(`Entity not found`),
    );
  });
  it('should delete a UserEntity', async () => {
    const spyDelete = jest.spyOn(repository, 'delete');
    const items = [new UserEntity(UserDataBuilder({}))];
    repository.items = items;
    await sut.execute({ id: items[0].id });
    expect(spyDelete).toHaveBeenCalledTimes(1);
  });
});
