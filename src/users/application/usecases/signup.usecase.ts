import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { BadRequestError } from '../errors/bad-request-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { UserOutput } from '../dtos/user-output';
import { IUseCase } from '@/shared/application/usecases/use-case';

export namespace SignupUseCase {
  export type Input = {
    name: string;
    email: string;
    password: string;
  };
  export type Output = UserOutput;

  export class UseCase implements IUseCase<Input, Output> {
    constructor(
      private readonly userReporitoy: IUserRepository.Repository,
      private readonly bcryptProvider: IHashProvider,
    ) {}
    async execute(input: Input): Promise<Output> {
      const { name, password, email } = input;
      if (!name || !password || !email)
        throw new BadRequestError(`Input data not provided`);

      await this.userReporitoy.emailExists(email);
      const hashPassword = await this.bcryptProvider.generateHash(password);

      const entity = new UserEntity(
        Object.assign(input, {
          password: hashPassword,
        }),
      );

      await this.userReporitoy.insert(entity);

      return entity.toJSON();
    }
  }
}
