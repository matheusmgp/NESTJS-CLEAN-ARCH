import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository';
import { PrismaClient } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UpdatePasswordUseCase } from '../../update-password.usecase';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptJsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';

describe('UpdatePasswordUseCase integration tests', () => {
  const prismaService = new PrismaClient();
  let repository: UserPrismaRepository;
  let sut: UpdatePasswordUseCase.UseCase;
  let module: TestingModule;
  let hashProvider: IHashProvider;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile();
    repository = new UserPrismaRepository(prismaService as any);
    hashProvider = new BcryptJsHashProvider();
  });
  beforeEach(async () => {
    sut = new UpdatePasswordUseCase.UseCase(repository, hashProvider);
    await prismaService.user.deleteMany({});
  });
  afterAll(async () => {
    await module.close();
  });
  it('should throws a ConflictError exception if entity is found by email', async () => {
    const entity = new UserEntity(UserDataBuilder({}));

    await expect(() =>
      sut.execute({
        id: entity.id,
        oldPassword: 'OldPassword',
        password: 'newPassword',
      }),
    ).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity.id}`),
    );
  });
  it('should throws a InvalidPasswordError exception if oldPassword not provided', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    await expect(() =>
      sut.execute({
        id: entity.id,
        oldPassword: '',
        password: 'newPassword',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError(`OldPassword and new password is required`),
    );
  });
  it('should throws a InvalidPasswordError exception if newPassword not provided', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    await expect(() =>
      sut.execute({
        id: entity.id,
        oldPassword: 'oldPassword',
        password: '',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError(`OldPassword and new password is required`),
    );
  });
  it('should update the password of a UserEntity', async () => {
    const hash = await hashProvider.generateHash('202020');
    const entity = new UserEntity(UserDataBuilder({ password: hash }));
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    const result = await sut.execute({
      id: entity.id,
      password: 'new-pass',
      oldPassword: '202020',
    });
    const checkNewPassword = await hashProvider.compareHash(
      'new-pass',
      result.password,
    );
    expect(checkNewPassword).toBeTruthy();
    expect(result).toMatchObject({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: result.password,
      createdAt: entity.createdAt,
    });
  });
});
