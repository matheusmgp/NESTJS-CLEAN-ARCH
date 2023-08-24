import { Module } from '@nestjs/common';
import { EnvConfigModule } from './shared/infrastructure/env-config/env-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [EnvConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
