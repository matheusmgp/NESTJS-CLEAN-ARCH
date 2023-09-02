import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';
import { InvalidPasswordErrorFilter } from '../../invalid-password-error.filter';
@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new InvalidPasswordError(`Invalid password data`);
  }
}
describe('InvalidPasswordFilter e2e test', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new InvalidPasswordErrorFilter());
    await app.init();
  });
  afterAll(async () => {
    await module.close();
  });
  it('should be defined', () => {
    expect(new InvalidPasswordErrorFilter()).toBeDefined();
  });
  it('should catch a InvalidPasswordError', () => {
    return request(app.getHttpServer()).get('/stub').expect(422).expect({
      statusCode: 422,
      error: 'Invalid Password',
      message: 'Invalid password data',
    });
  });
});
