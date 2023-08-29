import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { IUseCase } from '@/shared/application/usecases/use-case';
import { SearchInput } from '@/shared/application/dtos/search-input';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@/shared/application/dtos/pagination-output';
import { UserOutput, UserOutputMapper } from '../dtos/user-output';

export namespace ListUsersUseCase {
  export type Input = SearchInput;
  export type Output = PaginationOutput<UserOutput>;
  export class UseCase implements IUseCase<Input, Output> {
    constructor(private readonly userRepository: IUserRepository.Repository) {}
    async execute(input: Input): Promise<Output> {
      const params = new IUserRepository.SearchParams(input);
      const searchResult = await this.userRepository.search(params);
      return this.toOutput(searchResult);
    }

    private toOutput(searchResult: IUserRepository.SearchResult): Output {
      const items = searchResult.items.map(item => {
        return UserOutputMapper.toOutput(item);
      });
      return PaginationOutputMapper.toOutput(items, searchResult);
    }
  }
}
