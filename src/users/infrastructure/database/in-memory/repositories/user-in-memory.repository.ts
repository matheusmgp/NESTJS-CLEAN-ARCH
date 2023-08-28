import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { InMemorySearchableRepository } from '@/shared/domain/repositories/in-memory-searchable.repository';
import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { IUserRepository } from '@/users/domain/repositories/user.repository';

export class InMemoryUserRepository
  extends InMemorySearchableRepository<UserEntity>
  implements IUserRepository.Repository
{
  sortableFields: string[] = ['name', 'createdAt'];

  async findByEmail(email: string): Promise<UserEntity> {
    const entity = this.items.find(e => e.email == email);
    if (!entity) throw new NotFoundError(`Entity not found by email ${email}`);
    return entity;
  }
  async emailExists(email: string): Promise<void> {
    const entity = this.items.find(e => e.email === email);
    if (entity) throw new ConflictError(`Email already exists`);
  }
  protected async applyFilter(
    items: UserEntity[],
    filter: IUserRepository.Filter,
  ): Promise<UserEntity[]> {
    if (!filter) return items;

    return items.filter(item => {
      return item.props.name.toLowerCase().includes(filter.toLowerCase());
    });
  }
  protected async applySort(
    items: UserEntity[],
    sort: string | null,
    sortDir: SortDirection | null,
  ): Promise<UserEntity[]> {
    return !sort
      ? super.applySort(items, 'createdAt', 'desc')
      : super.applySort(items, sort, sortDir);
  }
}
