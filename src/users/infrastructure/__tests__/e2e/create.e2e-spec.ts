import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SignupDto } from '../../dtos/signup.dto';
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

describe('UsersController e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: IUserRepository.Repository;
  let signupDto: SignupDto;
  const prismaService = new PrismaClient();

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
  });

  beforeEach(async () => {
    signupDto = {
      name: 'test name',
      email: 'a@a.com',
      password: 'TestPassword123',
    };
    await prismaService.user.deleteMany();
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(201);
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      const user = await repository.findById(res.body.data.id);
      const presenter = UsersController.userToResponse(user.toJSON());
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });
    it('should throws exception 422 when dto is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({})
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'name must be a string',
        'name should not be empty',
        'email must be an email',
        'email must be a string',
        'email should not be empty',
        'password must be a string',
        'password should not be empty',
      ]);
    });
    it('should throws exception 422 when name field is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: null,
          email: 'a@a.com',
          password: 'TestPassword123',
        })
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'name must be a string',
        'name should not be empty',
      ]);
    });
    it('should throws exception 422 when email field is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'test',
          email: null,
          password: 'TestPassword123',
        })
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'email must be an email',
        'email must be a string',
        'email should not be empty',
      ]);
    });
    it('should throws exception 422 when password field is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'test',
          email: 'a@a.com',
          password: null,
        })
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'password must be a string',
        'password should not be empty',
      ]);
    });
    it('should throws exception 422 when invalid field is passed', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'test',
          email: 'a@a.com',
          password: 'pass',
          xpto: 'fake',
        })
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'property xpto should not exist',
      ]);
    });
    it('should throws exception 422 when email field is not email type is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'myname',
          email: 'notAvalidEmail',
          password: 'TestPassword123',
        })
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual(['email must be an email']);
    });
    it('should throws exception 409 when email already exists', async () => {
      const entity = new UserEntity(UserDataBuilder({ ...signupDto }));
      await repository.insert(entity);
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(409);
      expect(res.body.statusCode).toBe(409);
      expect(res.body.error).toBe('Conflict');
      expect(res.body.message).toStrictEqual('Email already in use');
    });
  });
});
