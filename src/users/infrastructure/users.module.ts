import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SignupUseCase } from '../application/usecases/signup.usecase';
import { InMemoryUserRepository } from './database/in-memory/repositories/user-in-memory.repository';
import { BcryptJsHashProvider } from './providers/hash-provider/bcryptjs-hash.provider';
import { IUserRepository } from '../domain/repositories/user.repository';
import { IHashProvider } from '@/shared/application/providers/hash-provider';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'UseRepository',
      useClass: InMemoryUserRepository,
    },
    {
      provide: 'HashProvider',
      useClass: BcryptJsHashProvider,
    },
    {
      provide: SignupUseCase.UseCase,
      useFactory: (
        userRepository: IUserRepository.Repository,
        hashProvider: IHashProvider,
      ) => {
        return new SignupUseCase.UseCase(userRepository, hashProvider);
      },
      inject: ['UseRepository', 'HashProvider'],
    },
  ],
})
export class UsersModule {}
