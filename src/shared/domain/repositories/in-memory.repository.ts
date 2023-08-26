import { BaseEntity } from '../entities/entity';
import { NotFoundError } from '../errors/not-found-error';
import { IRepository } from './repository-contracts';

export abstract class InMemoryRepository<E extends BaseEntity>
  implements IRepository<E>
{
  items: E[] = [];
  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }
  async update(entity: E): Promise<void> {
    await this.getById(entity.id);
    const index = this.items.findIndex(item => item.id === entity.id);
    this.items[index] = entity;
  }
  async findById(id: string): Promise<E> {
    return this.getById(id);
  }
  async findAll(): Promise<E[]> {
    return this.items;
  }
  async delete(id: string): Promise<void> {
    await this.getById(id);
    const index = this.items.findIndex(item => item.id === id);
    this.items.splice(index, 1);
  }
  protected async getById(id: string): Promise<E> {
    const _id = `${id}`;
    const entity = this.items.find(e => e.id == _id);
    if (!entity) throw new NotFoundError('Entity not found');
    return entity;
  }
}
