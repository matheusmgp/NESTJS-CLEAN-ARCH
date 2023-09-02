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
  });

  describe('GET /users/:id', () => {
    it('should findOne user', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const presenter = UsersController.userToResponse(entity.toJSON());
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
      expect(res.body.data).toStrictEqual(serialized);
    });

    it('should throws exception 404 when id not found', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/99999`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.message).toStrictEqual(
        'UserModel not found using ID 99999',
      );
    });
    it('should throws exception 401 when user not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/users/99999`)
        .set('Authorization', `Bearer invalidtoken`)
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
  });
});
