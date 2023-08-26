import { BaseEntity } from '@/shared/domain/entities/entity';
import { InMemoryRepository } from '../../in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';

type StubEntityProps = {
  name: string;
  price: number;
};
class StubEntity extends BaseEntity<StubEntityProps> {}

class StubInMemoryRepository extends InMemoryRepository<StubEntity> {}

describe('InMemory Repository unit tests', () => {
  let sut: StubInMemoryRepository;
  beforeEach(() => {
    sut = new StubInMemoryRepository();
  });

  it('should insert a new entity', async () => {
    const entity = new StubEntity({ name: 'test', price: 100 });
    await sut.insert(entity);
    expect(entity.toJSON()).toStrictEqual(sut.items[0].toJSON());
  });
  it('should throw error when entity not found', async () => {
    await expect(sut.findById('fake-id')).rejects.toThrow(
      new NotFoundError('Entity not found'),
    );
  });
  it('should find an entity by id', async () => {
    const entity = new StubEntity({ name: 'test', price: 100 });
    await sut.insert(entity);
    const result = await sut.findById(entity.id);
    expect(result.toJSON()).toStrictEqual(result.toJSON());
  });
  it('should return all entities', async () => {
    const entity = new StubEntity({ name: 'test', price: 100 });
    await sut.insert(entity);
    const result = await sut.findAll();
    expect(result).toStrictEqual([entity]);
  });
  it('should throw error when trying to update', async () => {
    const entity = new StubEntity({ name: 'test', price: 100 });
    await expect(sut.update(entity)).rejects.toThrow(
      new NotFoundError('Entity not found'),
    );
  });
  it('should update an entity', async () => {
    const entity = new StubEntity({ name: 'test', price: 100 });
    await sut.insert(entity);
    const entityUpdated = new StubEntity(
      { name: 'updated', price: 100 },
      entity.id,
    );
    await sut.update(entityUpdated);
    expect(entityUpdated.toJSON()).toStrictEqual(sut.items[0].toJSON());
  });
  it('should throw error when trying to update', async () => {
    await expect(sut.delete('fake-id')).rejects.toThrow(
      new NotFoundError('Entity not found'),
    );
  });
  it('should delete an entity by id', async () => {
    const entity = new StubEntity({ name: 'test', price: 100 });
    await sut.insert(entity);
    await sut.delete(entity.id);
    expect(sut.items).toHaveLength(0);
  });
});
