import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { UserOutput } from '../dtos/user-output';
import { IUseCase } from '@/shared/application/usecases/use-case';

export namespace GetUserUseCase {
  export type Input = {
    id: string;
  };
  export type Output = UserOutput;
  export class UseCase implements IUseCase<Input, Output> {
    constructor(private readonly userReporitoy: IUserRepository.Repository) {}
    async execute(input: Input): Promise<Output> {
      const { id } = input;
      const entity = await this.userReporitoy.findById(id);
      return entity.toJSON();
    }
  }
}
