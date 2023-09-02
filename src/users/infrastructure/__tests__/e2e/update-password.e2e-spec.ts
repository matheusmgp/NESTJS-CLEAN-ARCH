import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest';
import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UpdatePasswordDto } from '../../dtos/update-password.dto';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptJsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';

describe('UsersController e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: IUserRepository.Repository;
  let dto: UpdatePasswordDto;
  let hashProvider: IHashProvider;
  let entity: UserEntity;
  const prismaService = new PrismaClient();
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
  });

  beforeEach(async () => {
    dto = {
      oldPassword: '101010',
      password: '202020',
    };
    await prismaService.user.deleteMany();
    const hashPassword = await hashProvider.generateHash('101010');
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

  describe('PATCH /users/:id', () => {
    it('should update password of an user', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      const user = await repository.findById(res.body.data.id);
      const checkNewPassword = await hashProvider.compareHash(
        '202020',
        user.password,
      );
      expect(checkNewPassword).toBeTruthy();
    });
    it('should throws exception 422 when dto is empty', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/fakeid`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'password must be a string',
        'password should not be empty',
        'oldPassword must be a string',
        'oldPassword should not be empty',
      ]);
    });
    it('should throws exception 404 when id not found', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/fakeid`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(404);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.message).toStrictEqual(
        'UserModel not found using ID fakeid',
      );
    });
    it('should throws exception 422 when password field is invalid', async () => {
      delete dto.password;
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'password must be a string',
        'password should not be empty',
      ]);
    });
    it('should throws exception 422 when oldPassword field is invalid', async () => {
      delete dto.oldPassword;
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'oldPassword must be a string',
        'oldPassword should not be empty',
      ]);
    });
    it('should throws exception 422 when oldPassword and password does not match', async () => {
      dto.oldPassword = 'invalid';
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Invalid Password');
      expect(res.body.message).toStrictEqual('OldPassword does not match');
    });
    it('should throws exception 401 when user not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .set('Authorization', `Bearer invalidToken`)
        .send(dto)
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
  });
});
