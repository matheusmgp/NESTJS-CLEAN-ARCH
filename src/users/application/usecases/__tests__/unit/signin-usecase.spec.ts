import { InMemoryUserRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptJsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { SigninUseCase } from '../../signin.usecase';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { InvalidCredentialError } from '@/shared/application/errors/invalid-credential-error';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';

describe('SigninUseCase unit tests', () => {
  let repository: InMemoryUserRepository;
  let hashProvider: IHashProvider;
  let sut: SigninUseCase.UseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    hashProvider = new BcryptJsHashProvider();
    sut = new SigninUseCase.UseCase(repository, hashProvider);
  });

  it('should throw a BadRequest exception when email field is not passed', async () => {
    const props = { email: null, password: '1234' };
    await expect(() => sut.execute(props)).rejects.toThrow(
      new BadRequestError(`Input data not provided`),
    );
  });
  it('should throw a BadRequest exception when password field is not passed', async () => {
    const props = { email: 'a@a.com', password: null };
    await expect(() => sut.execute(props)).rejects.toThrow(
      new BadRequestError(`Input data not provided`),
    );
  });
  it('should throw a NotFoundError exception with wrong email', async () => {
    const props = { password: '101010', email: 'a@a.com' };
    await expect(() => sut.execute(props)).rejects.toThrow(
      new NotFoundError(`Entity not found by email a@a.com`),
    );
  });
  it('should throw a InvalidCredentialError exception when credentials does not match', async () => {
    const hashPass = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      UserDataBuilder({ password: hashPass, email: 'teste@teste.com' }),
    );
    repository.items = [entity];
    await expect(() =>
      sut.execute({
        email: entity.email,
        password: 'invalidpass',
      }),
    ).rejects.toThrow(new InvalidCredentialError(`Invalid credentials`));
  });
  it('should authenticate an user', async () => {
    const spyFindByEmail = jest.spyOn(repository, 'findByEmail');
    const hashPass = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      UserDataBuilder({ password: hashPass, email: 'teste@teste.com' }),
    );
    repository.items = [entity];
    const result = await sut.execute({
      email: entity.email,
      password: '1234',
    });
    expect(spyFindByEmail).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(entity.toJSON());
  });
});
