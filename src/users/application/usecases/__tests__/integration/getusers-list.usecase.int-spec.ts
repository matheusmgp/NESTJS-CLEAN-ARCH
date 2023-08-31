import { ListUsersUseCase } from '../../get-users-list.usecase';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { PrismaClient } from '@prisma/client';
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';

describe('ListUsersUseCase integration tests', () => {
  const prismaService = new PrismaClient();
  let repository: UserPrismaRepository;
  let sut: ListUsersUseCase.UseCase;
  let module: TestingModule;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile();
    repository = new UserPrismaRepository(prismaService as any);
  });
  beforeEach(async () => {
    sut = new ListUsersUseCase.UseCase(repository);
    await prismaService.user.deleteMany({});
  });
  afterAll(async () => {
    await module.close();
  });

  it('should return users ordered by createAd desc', async () => {
    const createdAt = new Date();
    const entities: UserEntity[] = [];
    const arrange = Array(3).fill(UserDataBuilder({}));
    arrange.forEach((element, index) => {
      entities.push(
        new UserEntity({
          ...element,
          email: `test${index}@mail.com`,
          createdAt: new Date(createdAt.getTime() + index),
        }),
      );
    });
    await prismaService.user.createMany({
      data: entities.map(item => item.toJSON()),
    });

    const output = await sut.execute({});
    expect(output).toStrictEqual({
      currentPage: 1,
      items: [...entities].reverse().map(item => item.toJSON()),
      lastPage: 1,
      perPage: 15,
      total: 3,
    });
  });
  it('should return users using pagination.sort and filter', async () => {
    const createdAt = new Date();
    const entities: UserEntity[] = [];
    const arrange = ['test', 'a', 'TEST', 'b', 'TeSt'];

    arrange.forEach((element, index) => {
      entities.push(
        new UserEntity({
          ...UserDataBuilder({
            name: element,
            createdAt: new Date(createdAt.getTime() + index),
          }),
        }),
      );
    });
    await prismaService.user.createMany({
      data: entities.map(item => item.toJSON()),
    });

    let output = await sut.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'test',
    });
    expect(output).toStrictEqual({
      currentPage: 1,
      items: [entities[0].toJSON(), entities[4].toJSON()],
      lastPage: 2,
      perPage: 2,
      total: 3,
    });
    output = await sut.execute({
      page: 2,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'test',
    });
    expect(output).toStrictEqual({
      currentPage: 2,
      items: [entities[2].toJSON()],
      lastPage: 2,
      perPage: 2,
      total: 3,
    });
    output = await sut.execute({
      page: 3,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'test',
    });
    expect(output).toStrictEqual({
      currentPage: 3,
      items: [],
      lastPage: 2,
      perPage: 2,
      total: 3,
    });
    output = await sut.execute({
      page: 1,
      perPage: 3,
      sort: 'name',
      sortDir: 'desc',
      filter: 'test',
    });
    expect(output).toStrictEqual({
      currentPage: 1,
      items: [entities[2].toJSON(), entities[4].toJSON(), entities[0].toJSON()],
      lastPage: 1,
      perPage: 3,
      total: 3,
    });
  });
});
