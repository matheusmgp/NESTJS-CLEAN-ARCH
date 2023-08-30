import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { IUseCase } from '@/shared/application/usecases/use-case';

export namespace DeleteUserUseCase {
  export type Input = {
    id: string;
  };
  export type Output = void;
  export class UseCase implements IUseCase<Input, Output> {
    constructor(private readonly userReporitoy: IUserRepository.Repository) {}
    async execute(input: Input): Promise<void> {
      const { id } = input;
      await this.userReporitoy.delete(id);
    }
  }
}
