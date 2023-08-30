import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { UserOutput, UserOutputMapper } from '../dtos/user-output';
import { IUseCase } from '@/shared/application/usecases/use-case';
import { InvalidCredentialError } from '@/shared/application/errors/invalid-credential-error';

export namespace SigninUseCase {
  export type Input = {
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
      const { password, email } = input;
      if (!password || !email)
        throw new BadRequestError(`Input data not provided`);

      const entity = await this.userReporitoy.findByEmail(email);
      const matchesPasswords = await this.bcryptProvider.compareHash(
        password,
        entity.password,
      );
      if (!matchesPasswords)
        throw new InvalidCredentialError(`Invalid credentials`);

      return UserOutputMapper.toOutput(entity);
    }
  }
}
