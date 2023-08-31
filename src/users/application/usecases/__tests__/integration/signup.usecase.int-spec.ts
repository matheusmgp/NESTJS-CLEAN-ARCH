import { PrismaClient } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository';
import { SignupUseCase } from '../../signup.usecase';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptJsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';

describe('SignupUsecase integration tests', () => {
  const prismaService = new PrismaClient();
  let repository: UserPrismaRepository;
  let sut: SignupUseCase.UseCase;
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
    sut = new SignupUseCase.UseCase(repository, hashProvider);
    await prismaService.user.deleteMany({});
  });
  afterAll(async () => {
    await module.close();
  });
  it('should create an user', async () => {
    const props = {
      name: 'myname',
      email: 'a@a.com',
      password: '1234',
    };

    const output = await sut.execute(props);
    expect(output.id).toBeDefined();
    expect(output.createdAt).toBeDefined();
    expect(output.createdAt).toBeInstanceOf(Date);
  });
});
