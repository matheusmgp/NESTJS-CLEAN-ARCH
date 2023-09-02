import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { InvalidCredentialError } from '@/shared/application/errors/invalid-credential-error';
import { InvalidCredentialErrorFilter } from '../../invalid-credential-error.filter';
@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new InvalidCredentialError(`Invalid Credential data`);
  }
}
describe('InvalidCredentialFilter e2e test', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new InvalidCredentialErrorFilter());
    await app.init();
  });
  afterAll(async () => {
    await module.close();
  });
  it('should be defined', () => {
    expect(new InvalidCredentialErrorFilter()).toBeDefined();
  });
  it('should catch a InvalidCredentialError', () => {
    return request(app.getHttpServer()).get('/stub').expect(401).expect({
      statusCode: 401,
      error: 'Invalid Credential',
      message: 'Invalid Credential data',
    });
  });
});
