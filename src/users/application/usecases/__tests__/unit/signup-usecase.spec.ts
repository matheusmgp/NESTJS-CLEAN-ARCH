import { SignupUseCase } from '../../signup.usecase';
import { InMemoryUserRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptJsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { ConflictError } from '@/shared/domain/errors/conflict-error';

describe('SignupUseCase unit tests', () => {
  let repository: InMemoryUserRepository;
  let hashProvider: IHashProvider;
  let sut: SignupUseCase.UseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    hashProvider = new BcryptJsHashProvider();
    sut = new SignupUseCase.UseCase(repository, hashProvider);
  });
  it('should create a user', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    const props = UserDataBuilder({});
    const result = await sut.execute(props);
    expect(result.id).toBeDefined;
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(spyInsert).toHaveBeenCalledTimes(1);
  });
  it('should throw a ConflictError exception when email already exists', async () => {
    const props = UserDataBuilder({ email: 'email@email.com' });
    await sut.execute(props);

    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
  it('should throw a BadRequest exception when name field is not passed', async () => {
    const props = Object.assign(UserDataBuilder({}), { name: null });
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
  it('should throw a BadRequest exception when password field is not passed', async () => {
    const props = Object.assign(UserDataBuilder({}), { password: null });
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
  it('should throw a BadRequest exception when email field is not passed', async () => {
    const props = Object.assign(UserDataBuilder({}), { email: null });
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});
