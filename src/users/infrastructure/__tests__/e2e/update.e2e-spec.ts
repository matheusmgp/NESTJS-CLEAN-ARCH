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
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptJsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';

describe('UsersController e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: IUserRepository.Repository;
  let updateUserDto: UpdateUserDto;
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
    updateUserDto = {
      name: 'test name',
    };
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

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      updateUserDto.name = 'test test';
      const res = await request(app.getHttpServer())
        .put(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto)
        .expect(200);
      const user = await repository.findById(res.body.data.id);
      const presenter = UsersController.userToResponse(user.toJSON());
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
      expect(res.body.data.name).toStrictEqual('test test');
    });
    it('should throws exception 422 when dto name is empty', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'name must be a string',
        'name should not be empty',
      ]);
    });
    it('should throws exception 404 when id not found', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/99999`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto)
        .expect(404);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.message).toStrictEqual(
        'UserModel not found using ID 99999',
      );
    });
    it('should throws exception 401 when user not authenticated', async () => {
      await request(app.getHttpServer())
        .put(`/users/99999`)
        .set('Authorization', `Bearer invaidToken`)
        .send(updateUserDto)
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
  });
});
