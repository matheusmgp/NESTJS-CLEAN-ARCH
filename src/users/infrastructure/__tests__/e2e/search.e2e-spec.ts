import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest';
import { UsersController } from '../../users.controller';
import { instanceToPlain } from 'class-transformer';
import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptJsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';

describe('UsersController e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: IUserRepository.Repository;
  const prismaService = new PrismaClient();
  let entity: UserEntity;
  let hashProvider: IHashProvider;
  let hashPassword: string;
  let accessToken: string;
  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile();
    app = module.createNestApplication();
    applyGlobalConfig(app);
    await app.init();
    repository = module.get<IUserRepository.Repository>('UserRepository');
    hashProvider = new BcryptJsHashProvider();
    hashPassword = await hashProvider.generateHash('101010');
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
    entity = new UserEntity(
      UserDataBuilder({ email: 'meu@meu.com', password: hashPassword }),
    );
    await repository.insert(entity);
    const loginResponse = await request(app.getHttpServer())
      .post(`/users/login`)
      .send({ email: entity.email, password: '101010' })
      .expect(200);
    accessToken = loginResponse.body.accessToken;

    await repository.delete(entity.id);
  });

  describe('GET /users search', () => {
    it('should return first registers ordered by createAt desc', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = Array(3).fill(UserDataBuilder({}));
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...element,
            email: `a${index}@a.com`,
            createdAt: new Date(createdAt.getTime() + index),
          }),
        );
      });
      await prismaService.user.createMany({
        data: entities.map(item => item.toJSON()),
      });
      const searchParams = {};
      const queryParams = new URLSearchParams(searchParams as any).toString();

      const res = await request(app.getHttpServer())
        .get(`/users?${queryParams}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      expect(res.body).toStrictEqual({
        data: [...entities]
          .reverse()
          .map(item => instanceToPlain(UsersController.userToResponse(item))),
        meta: { currentPage: 1, perPage: 15, lastPage: 1, total: 3 },
      });
    });
    it('should throws exception 422 when query params are invalid', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users?fakeid=10`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual(['property fakeid should not exist']);
    });
    it('should return first registers with all params', async () => {
      const entities: UserEntity[] = [];
      const arrange = ['test', 'a', 'TEST', 'b', 'TeSt'];
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...UserDataBuilder({}),
            name: element,
            email: `a${index}@a.com`,
          }),
        );
      });
      await prismaService.user.createMany({
        data: entities.map(item => item.toJSON()),
      });
      const searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST',
      };
      const queryParams = new URLSearchParams(searchParams as any).toString();

      const res = await request(app.getHttpServer())
        .get(`/users?${queryParams}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      expect(res.body).toStrictEqual({
        data: [entities[0].toJSON(), entities[4].toJSON()].map(item =>
          instanceToPlain(UsersController.userToResponse(item)),
        ),
        meta: { currentPage: 1, perPage: 2, lastPage: 2, total: 3 },
      });
    });
    it('should throws exception 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/users?fakeid=10`)
        .set('Authorization', `Bearer invalidToken`)
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
  });
});
