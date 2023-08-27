import { UserEntity } from '@/users/domain/entities/user.entity';
import { InMemoryUserRepository } from '../../user-in-memory.repository';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { ConflictError } from '@/shared/domain/errors/conflict-error';

describe('InMemoryUserRepository unit tests', () => {
  let sut: InMemoryUserRepository;
  beforeEach(() => {
    sut = new InMemoryUserRepository();
  });

  it('should throw a exception NOTFOUND - findByEmail method', async () => {
    const email = 'fake@email.com';
    await expect(sut.findByEmail(email)).rejects.toThrow(
      new NotFoundError(`Entity not found by email ${email}`),
    );
  });
  it('should find a entity by email - findByEmail method', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await sut.insert(entity);
    const result = await sut.findByEmail(entity.email);
    expect(result.toJSON()).toStrictEqual(entity.toJSON());
  });
  it('should throw a exception CONFLICTERROR - emailExists method', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await sut.insert(entity);
    await expect(sut.emailExists(entity.email)).rejects.toThrow(
      new ConflictError(`Email already exists`),
    );
  });
  it('should return false - emailExists method', async () => {
    expect.assertions(0);
    const email = 'fake@email.com';
    await sut.emailExists(email);
  });
  it('should find when filter is null', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await sut.insert(entity);
    const result = await sut.findAll();
    const spyFilter = jest.spyOn(result, 'filter');
    const itemsFiltered = await sut['applyFilter'](result, null);
    expect(spyFilter).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(result);
  });
  it('should FILTER by name and return list', async () => {
    const items = [
      new UserEntity(UserDataBuilder({ name: 'gustavo' })),
      new UserEntity(UserDataBuilder({ name: 'matheus' })),
      new UserEntity(UserDataBuilder({ name: 'GUSTAVO' })),
    ];

    const spyFilter = jest.spyOn(items, 'filter');
    const itemsFiltered = await sut['applyFilter'](items, 'gustavo');
    expect(spyFilter).toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual([items[0], items[2]]);
  });
});
