import { PrismaClient } from '@prisma/client';
import { UserPrismaRepository } from '../../user-prisma.repository';
import { Test } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { ConflictError } from '@/shared/domain/errors/conflict-error';

describe('UserPrismaRespotory integration tests', () => {
  const prismaService = new PrismaClient();
  let sut: UserPrismaRepository;

  beforeAll(async () => {
    setupPrismaTests();
    await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile();
  });
  beforeEach(async () => {
    sut = new UserPrismaRepository(prismaService as any);
    await prismaService.user.deleteMany({});
  });

  it('should throws NotFoundError error when entity not found', async () => {
    await expect(() => sut.findById('fakeId')).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID fakeId`),
    );
  });
  it('should find an entity by id', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    });
    const output = await sut.findById(newUser.id);
    expect(output.toJSON()).toStrictEqual(entity.toJSON());
  });
  it('should create a new userEntity', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await sut.insert(entity);
    const result = await prismaService.user.findUnique({
      where: {
        id: entity.id,
      },
    });
    expect(result).toStrictEqual(entity.toJSON());
  });
  it('should return all users', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    const entities = await sut.findAll();
    expect(entities).toHaveLength(1);
    entities.map(item => expect(item.toJSON()).toStrictEqual(entity.toJSON()));
  });
  it('should throws NotFoundError error when entity not found on update', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await expect(() => sut.update(entity)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity.id}`),
    );
  });
  it('should update an entity name', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    entity.update('new name');
    await sut.update(entity);
    const output = await prismaService.user.findUnique({
      where: {
        id: entity.id,
      },
    });
    expect(output.name).toStrictEqual('new name');
  });
  it('should throws NotFoundError error when entity not found on delete', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await expect(() => sut.delete(entity.id)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity.id}`),
    );
  });
  it('should delete an entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    await sut.delete(entity.id);
    const output = await prismaService.user.findUnique({
      where: {
        id: entity.id,
      },
    });
    expect(output).toBeNull();
  });
  it('should throws NotFoundError error when entity not found on findByEmail', async () => {
    await expect(() => sut.findByEmail('fake@fake.com')).rejects.toThrow(
      new NotFoundError(`UserModel not found using email fake@fake.com`),
    );
  });
  it('should findById a userEntity', async () => {
    const entity = new UserEntity(
      UserDataBuilder({ email: 'specific@email.com' }),
    );
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    const output = await sut.findByEmail('specific@email.com');

    expect(output.toJSON()).toStrictEqual(entity.toJSON());
  });
  it('should throws a ConflictError exception if entity is found by email', async () => {
    const entity = new UserEntity(
      UserDataBuilder({ email: 'specific@email.com' }),
    );
    await prismaService.user.create({
      data: entity.toJSON(),
    });
    await expect(() => sut.emailExists('specific@email.com')).rejects.toThrow(
      new ConflictError(`Email already in use`),
    );
  });
  it('should not find entity by email', async () => {
    expect.assertions(0);
    await sut.emailExists('nonExisting@email.com');
  });
  describe('UserPrismaRespotory search methods', () => {
    it('should apply only pagination when params null', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = Array(16).fill(UserDataBuilder({}));
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
      const searchOutput = await sut.search(new IUserRepository.SearchParams());

      const items = searchOutput.items;

      expect(searchOutput).toBeInstanceOf(IUserRepository.SearchResult);
      expect(searchOutput.total).toBe(16);
      expect(searchOutput.items.length).toBe(15);
      searchOutput.items.forEach(item => {
        expect(item).toBeInstanceOf(UserEntity);
      });
      items.reverse().forEach((item, index) => {
        expect(`test${index + 1}@mail.com`).toBe(item.email);
      });
    });
    it('should search with filter,sort and pagination', async () => {
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
      const searchOutputPage1 = await sut.search(
        new IUserRepository.SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      );

      expect(searchOutputPage1.items[0].toJSON()).toMatchObject(
        entities[0].toJSON(),
      );
      expect(searchOutputPage1.items[1].toJSON()).toMatchObject(
        entities[4].toJSON(),
      );
      const searchOutputPage2 = await sut.search(
        new IUserRepository.SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      );

      expect(searchOutputPage2.items[0].toJSON()).toMatchObject(
        entities[2].toJSON(),
      );
    });
  });
});
