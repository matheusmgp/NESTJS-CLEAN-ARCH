import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { UserOutput, UserOutputMapper } from '../dtos/user-output';
import { IUseCase } from '@/shared/application/usecases/use-case';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';

export namespace UpdateUserUseCase {
  export type Input = {
    id: string;
    name: string;
  };
  export type Output = UserOutput;
  export class UseCase implements IUseCase<Input, Output> {
    constructor(private readonly userReporitoy: IUserRepository.Repository) {}
    async execute(input: Input): Promise<Output> {
      const { id, name } = input;
      if (!name) throw new BadRequestError(`Name not provided`);
      const entity = await this.userReporitoy.findById(id);
      entity.update(name);
      await this.userReporitoy.update(entity);
      return UserOutputMapper.toOutput(entity);
    }
  }
}
