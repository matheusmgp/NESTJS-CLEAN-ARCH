import { PrismaClient } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptJsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { SigninUseCase } from '../../signin.usecase';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { InvalidCredentialError } from '@/shared/application/errors/invalid-credential-error';

describe('SigninUsecase integration tests', () => {
  const prismaService = new PrismaClient();
  let repository: UserPrismaRepository;
  let sut: SigninUseCase.UseCase;
  let hashProvider: IHashProvider;
  let module: TestingModule;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile();
    repository = new UserPrismaRepository(prismaService as any);
    hashProvider = new BcryptJsHashProvider();
  });
  beforeEach(async () => {
    sut = new SigninUseCase.UseCase(repository, hashProvider);
    await prismaService.user.deleteMany({});
  });
  afterAll(async () => {
    await module.close();
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
      new NotFoundError(`UserModel not found using email a@a.com`),
    );
  });
  it('should throw a InvalidCredentialError exception when credentials does not match', async () => {
    const hashPass = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      UserDataBuilder({ password: hashPass, email: 'teste@teste.com' }),
    );
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    await expect(() =>
      sut.execute({
        email: entity.email,
        password: 'invalidpass',
      }),
    ).rejects.toThrow(new InvalidCredentialError(`Invalid credentials`));
  });
  it('should authenticate an user', async () => {
    const hashPass = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      UserDataBuilder({ password: hashPass, email: 'teste@teste.com' }),
    );
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    const result = await sut.execute({
      email: entity.email,
      password: '1234',
    });

    expect(result).toStrictEqual(entity.toJSON());
  });
});
