import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { SignupUseCase } from '../application/usecases/signup.usecase';
import { BcryptJsHashProvider } from './providers/hash-provider/bcryptjs-hash.provider';
import { IUserRepository } from '../domain/repositories/user.repository';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { SigninUseCase } from '../application/usecases/signin.usecase';
import { ListUsersUseCase } from '../application/usecases/get-users-list.usecase';
import { GetUserUseCase } from '../application/usecases/getuser.usecase';
import { DeleteUserUseCase } from '../application/usecases/deleteuser.usecase';
import { UpdateUserUseCase } from '../application/usecases/update-user.usecase';
import { UpdatePasswordUseCase } from '../application/usecases/update-password.usecase';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { UserPrismaRepository } from './database/prisma/repositories/user-prisma.repository';
import { AuthModule } from '@/auth/infrastructure/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    {
      provide: 'PrismaService',
      useClass: PrismaService,
    },
    {
      provide: 'UserRepository',
      useFactory: (prismaService: PrismaService) => {
        return new UserPrismaRepository(prismaService);
      },
      inject: ['PrismaService'],
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
      inject: ['UserRepository', 'HashProvider'],
    },
    {
      provide: SigninUseCase.UseCase,
      useFactory: (
        userRepository: IUserRepository.Repository,
        hashProvider: IHashProvider,
      ) => {
        return new SigninUseCase.UseCase(userRepository, hashProvider);
      },
      inject: ['UserRepository', 'HashProvider'],
    },
    {
      provide: ListUsersUseCase.UseCase,
      useFactory: (userRepository: IUserRepository.Repository) => {
        return new ListUsersUseCase.UseCase(userRepository);
      },
      inject: ['UserRepository'],
    },
    {
      provide: GetUserUseCase.UseCase,
      useFactory: (userRepository: IUserRepository.Repository) => {
        return new GetUserUseCase.UseCase(userRepository);
      },
      inject: ['UserRepository'],
    },
    {
      provide: DeleteUserUseCase.UseCase,
      useFactory: (userRepository: IUserRepository.Repository) => {
        return new DeleteUserUseCase.UseCase(userRepository);
      },
      inject: ['UserRepository'],
    },
    {
      provide: UpdateUserUseCase.UseCase,
      useFactory: (userRepository: IUserRepository.Repository) => {
        return new UpdateUserUseCase.UseCase(userRepository);
      },
      inject: ['UserRepository'],
    },
    {
      provide: UpdatePasswordUseCase.UseCase,
      useFactory: (
        userRepository: IUserRepository.Repository,
        hashProvider: IHashProvider,
      ) => {
        return new UpdatePasswordUseCase.UseCase(userRepository, hashProvider);
      },
      inject: ['UserRepository', 'HashProvider'],
    },
  ],
})
export class UsersModule {}
