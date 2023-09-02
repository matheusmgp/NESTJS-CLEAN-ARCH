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
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { SigninDto } from '../../dtos/signin.dto';
import { BcryptJsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';

describe('UsersController e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: IUserRepository.Repository;
  let signinDto: SigninDto;
  let hashProvider: IHashProvider;
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
    hashProvider = new BcryptJsHashProvider();
  });

  beforeEach(async () => {
    signinDto = {
      email: 'a@a.com',
      password: 'TestPassword123',
    };
    await prismaService.user.deleteMany();
  });

  describe('POST /users/login', () => {
    it('should authenticate an user', async () => {
      const passwordHash = await hashProvider.generateHash(signinDto.password);
      const entity = new UserEntity(
        UserDataBuilder({ email: signinDto.email, password: passwordHash }),
      );
      await repository.insert(entity);

      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['accessToken']);
      expect(typeof res.body.accessToken).toStrictEqual('string');
    });
    it('should throws exception 422 when dto is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({})
        .expect(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toStrictEqual([
        'email must be an email',
        'email must be a string',
        'email should not be empty',
        'password must be a string',
        'password should not be empty',
      ]);
    });
    it('should throws exception 422 when password field is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({
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
    it('should throws exception 422 when email field is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: null,
          password: 'teste',
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
    it('should throws exception 404 when email does not exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'notfound@email.com',
          password: 'teste',
        })
        .expect(404);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.message).toStrictEqual(
        'UserModel not found using email notfound@email.com',
      );
    });
    it('should throws exception 403 when email is incorrect', async () => {
      const passwordHash = await hashProvider.generateHash(signinDto.password);
      const entity = new UserEntity(
        UserDataBuilder({ email: signinDto.email, password: passwordHash }),
      );
      await repository.insert(entity);

      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: signinDto.email,
          password: 'wrong-pass',
        })
        .expect(403);
      expect(res.body.statusCode).toBe(403);
      expect(res.body.error).toBe('Invalid Credential');
      expect(res.body.message).toStrictEqual('Invalid credentials');
    });
  });
});
