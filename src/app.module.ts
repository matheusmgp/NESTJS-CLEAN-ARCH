import { Module } from '@nestjs/common';
import { EnvConfigModule } from './shared/infrastructure/env-config/env-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/infrastructure/users.module';

@Module({
  imports: [EnvConfigModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
