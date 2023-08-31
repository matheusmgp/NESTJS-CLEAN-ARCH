import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository';
import { PrismaClient } from '@prisma/client';
import { UpdateUserUseCase } from '../../update-user.usecase';
import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('UpdateUserUseCase integration tests', () => {
  const prismaService = new PrismaClient();
  let repository: UserPrismaRepository;
  let sut: UpdateUserUseCase.UseCase;
  let module: TestingModule;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile();
    repository = new UserPrismaRepository(prismaService as any);
  });
  beforeEach(async () => {
    sut = new UpdateUserUseCase.UseCase(repository);
    await prismaService.user.deleteMany({});
  });
  afterAll(async () => {
    await module.close();
  });
  it('should throw a NotFoundError exception when entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fake-id', name: 'test' }),
    ).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID fake-id`),
    );
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
    const entity = new UserEntity(UserDataBuilder({}));
    await prismaService.user.create({
      data: entity,
    });
    const result = await sut.execute({ id: entity.id, name: 'new name' });
    expect(result).toMatchObject({
      id: entity.id,
      name: 'new name',
      email: entity.email,
      password: entity.password,
      createdAt: entity.createdAt,
    });
  });
});
