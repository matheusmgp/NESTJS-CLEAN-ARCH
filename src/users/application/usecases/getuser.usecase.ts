import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { UserOutput } from '../dtos/user-output';

/* eslint-disable @typescript-eslint/no-namespace */
export namespace GetUserUseCase {
  export type Input = {
    id: string;
  };

  export class UseCase {
    constructor(private readonly userReporitoy: IUserRepository.Repository) {}
    async execute(input: Input): Promise<UserOutput> {
      const { id } = input;
      const entity = await this.userReporitoy.findById(id);
      return entity.toJSON();
    }
  }
}
