import { InMemoryUserRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UpdatePasswordUseCase } from '../../update-password.usecase';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptJsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';

describe('UpdatePasswordUseCase unit tests', () => {
  let repository: InMemoryUserRepository;
  let sut: UpdatePasswordUseCase.UseCase;
  let hashProvider: IHashProvider;
  beforeEach(() => {
    repository = new InMemoryUserRepository();
    hashProvider = new BcryptJsHashProvider();
    sut = new UpdatePasswordUseCase.UseCase(repository, hashProvider);
  });
  it('should throw a NotFoundError exception when entity not found', async () => {
    await expect(() =>
      sut.execute({
        id: 'fake-id',
        password: 'test-pass',
        oldPassword: 'fake',
      }),
    ).rejects.toThrow(new NotFoundError(`Entity not found`));
  });
  it('should throw a InvalidPasswordError exception when password is null ', async () => {
    const items = [new UserEntity(UserDataBuilder({}))];
    repository.items = items;
    await expect(() =>
      sut.execute({ id: items[0].id, password: null, oldPassword: 'fake' }),
    ).rejects.toThrow(
      new InvalidPasswordError(`OldPassword and new password is required`),
    );
  });
  it('should throw a InvalidPasswordError exception when oldPassword is null', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    repository.items = [entity];
    await expect(() =>
      sut.execute({
        id: entity.id,
        password: entity.password,
        oldPassword: null,
      }),
    ).rejects.toThrow(
      new InvalidPasswordError(`OldPassword and new password is required`),
    );
  });
  it('should throw a InvalidPasswordError exception when oldPassword does not match new password', async () => {
    const hash = await hashProvider.generateHash('101010');
    const entity = new UserEntity(UserDataBuilder({ password: hash }));
    repository.items = [entity];
    await expect(() =>
      sut.execute({
        id: entity.id,
        password: entity.password,
        oldPassword: '202020',
      }),
    ).rejects.toThrow(new InvalidPasswordError(`OldPassword does not match`));
  });
  it('should update the password of a UserEntity', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const hash = await hashProvider.generateHash('202020');
    const items = [new UserEntity(UserDataBuilder({ password: hash }))];
    repository.items = items;
    const result = await sut.execute({
      id: items[0].id,
      password: 'new-pass',
      oldPassword: '202020',
    });
    const checkNewPassword = await hashProvider.compareHash(
      'new-pass',
      result.password,
    );
    expect(checkNewPassword).toBeTruthy();
    expect(result).toMatchObject({
      id: items[0].id,
      name: items[0].name,
      email: items[0].email,
      password: items[0].password,
      createdAt: items[0].createdAt,
    });
    expect(spyUpdate).toHaveBeenCalledTimes(1);
  });
});
