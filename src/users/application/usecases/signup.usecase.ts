import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { BadRequestError } from '../errors/bad-request-error';
import { UserEntity } from '@/users/domain/entities/user.entity';

/* eslint-disable @typescript-eslint/no-namespace */
export namespace SignupUseCase {
  export type Input = {
    name: string;
    email: string;
    password: string;
  };
  export type Output = {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
  };
  export class UseCase {
    constructor(private readonly userReporitoy: IUserRepository.Repository) {}
    async execute(input: Input): Promise<Output> {
      const { name, password, email } = input;
      if (!name || !password || !email)
        throw new BadRequestError(`Input data not provided`);

      await this.userReporitoy.emailExists(email);

      const entity = new UserEntity(input);

      await this.userReporitoy.insert(entity);

      return entity.toJSON();
    }
  }
}
