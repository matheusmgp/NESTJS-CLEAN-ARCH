import { BaseEntity } from '../entities/entity';

export interface IRepository<E extends BaseEntity> {
  insert(entity: E): Promise<void>;
  update(entity: E): Promise<void>;
  findById(id: string): Promise<E>;
  findById(): Promise<E[]>;
  delete(id: string): Promise<void>;
}
