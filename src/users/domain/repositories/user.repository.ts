import { IRepository } from '@/shared/domain/repositories/repository-contracts';
import { UserEntity } from '../entities/user.entity';

export interface IUserRepository extends IRepository<UserEntity> {
  findByEmail(email: string): Promise<UserEntity>;
  emailExists(email: string): Promise<void>;
}
