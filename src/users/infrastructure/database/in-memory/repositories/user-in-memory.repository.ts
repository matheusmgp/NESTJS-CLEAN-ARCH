import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { InMemoryRepository } from '@/shared/domain/repositories/in-memory.repository';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { IUserRepository } from '@/users/domain/repositories/user.repository';

export class InMemoryUserRepository
  extends InMemoryRepository<UserEntity>
  implements IUserRepository
{
  async findByEmail(email: string): Promise<UserEntity> {
    const entity = this.items.find(e => e.email == email);
    if (!entity) throw new NotFoundError(`Entity not found by email ${email}`);
    return entity;
  }
  async emailExists(email: string): Promise<void> {
    const entity = this.items.find(e => e.email == email);
    if (entity) throw new ConflictError(`Email already exists ${email}`);
  }
}
