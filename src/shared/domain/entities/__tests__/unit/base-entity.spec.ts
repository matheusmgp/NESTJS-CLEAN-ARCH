import { validate as uuidValidate } from 'uuid';
import { BaseEntity } from '../../entity';

type StubProps = {
  prop1: string;
  prop2: number;
};
class StubEntity extends BaseEntity<StubProps> {}

describe('BaseEntity unit tests', () => {
  it('should set props and id', () => {
    const props = {
      prop1: 'value1',
      prop2: 999,
    };
    const entity = new StubEntity(props);
    expect(entity.props).toStrictEqual(props);
    expect(entity.id).not.toBeNull();
    expect(uuidValidate(entity.id)).toBeTruthy();
  });
  it('should accept a valid uuid', () => {
    const props = {
      prop1: 'value1',
      prop2: 999,
    };
    const UUID = '1e97134d-2306-47fc-8416-585aacd9e990';
    const entity = new StubEntity(props, UUID);
    expect(uuidValidate(entity.id)).toBeTruthy();
    expect(entity.id).toBe(UUID);
  });
  it('should not accept an invalid uuid', () => {
    const props = {
      prop1: 'value1',
      prop2: 999,
    };
    const UUID = 'INVALID-UUID';
    const entity = new StubEntity(props, UUID);
    expect(uuidValidate(entity.id)).toBeFalsy();
    expect(entity.id).toBe(UUID);
  });
  it('should convert an entity into a JSON', () => {
    const props = {
      prop1: 'value1',
      prop2: 999,
    };
    const id = '1e97134d-2306-47fc-8416-585aacd9e990';
    const entity = new StubEntity(props, id);
    expect(entity.toJSON()).toStrictEqual({ id, ...props });
  });
});
