import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { IUseCase } from '@/shared/application/usecases/use-case';
import { SearchInput } from '@/shared/application/dtos/search-input';

export namespace ListUsersUseCase {
  export type Input = SearchInput;
  export type Output = void;
  export class UseCase implements IUseCase<Input, Output> {
    constructor(private readonly userRepository: IUserRepository.Repository) {}
    async execute(input: Input): Promise<Output> {
      const params = new IUserRepository.SearchParams(input);
      const searchResult = await this.userRepository.search(params);
      return;
    }
  }
}
