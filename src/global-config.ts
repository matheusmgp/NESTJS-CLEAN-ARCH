import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { WrapperDataInterceptor } from './shared/infrastructure/interceptors/wrapper/wrapper.interceptor';

export function applyGlobalConfig(app: INestApplication) {
  app.useGlobalInterceptors(
    new WrapperDataInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
}
