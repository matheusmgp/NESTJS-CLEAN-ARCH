import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { UserOutput, UserOutputMapper } from '../dtos/user-output';
import { IUseCase } from '@/shared/application/usecases/use-case';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';
import { IHashProvider } from '@/shared/application/providers/hash-provider';

export namespace UpdatePasswordUseCase {
  export type Input = {
    id: string;
    password: string;
    oldPassword: string;
  };
  export type Output = UserOutput;
  export class UseCase implements IUseCase<Input, Output> {
    constructor(
      private readonly userReporitoy: IUserRepository.Repository,
      private readonly hashProvider: IHashProvider,
    ) {}
    async execute(input: Input): Promise<Output> {
      const { id, password, oldPassword } = input;
      const entity = await this.userReporitoy.findById(id);
      if (!password || !oldPassword)
        throw new InvalidPasswordError(
          `OldPassword and new password is required`,
        );

      const checkOldPassword = await this.hashProvider.compareHash(
        oldPassword,
        entity.password,
      );
      if (!checkOldPassword)
        throw new InvalidPasswordError(`OldPassword does not match`);
      input.password = await this.hashProvider.generateHash(password);
      entity.updatePassword(input.password);
      await this.userReporitoy.update(entity);
      return UserOutputMapper.toOutput(entity);
    }
  }
}
