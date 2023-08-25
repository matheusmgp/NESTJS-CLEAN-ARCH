import { UserEntity, UserProps } from '../../user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('UserEntity unit tests', () => {
  let props: UserProps;
  let sut: UserEntity;
  beforeEach(() => {
    props = UserDataBuilder({});
    sut = new UserEntity(props);
  });
  it('Constructor method', () => {
    expect(sut.props.name).toEqual(props.name);
    expect(sut.props.email).toEqual(props.email);
    expect(sut.props.password).toEqual(props.password);
    expect(sut.props.createdAt).toBeInstanceOf(Date);
  });
  it('get name method', () => {
    expect(sut.name).toBeDefined();
    expect(sut.name).toEqual(props.name);
    expect(typeof sut.name).toBe('string');
  });
  it('set name method', () => {
    sut['name'] = 'other name';
    expect(sut.name).toEqual('other name');
    expect(typeof sut.name).toBe('string');
  });
  it('get email method', () => {
    expect(sut.email).toBeDefined();
    expect(sut.email).toEqual(props.email);
    expect(typeof sut.email).toBe('string');
  });
  it('get password method', () => {
    expect(sut.password).toBeDefined();
    expect(sut.password).toEqual(props.password);
    expect(typeof sut.password).toBe('string');
  });
  it('set password method', () => {
    sut['password'] = 'other password';
    expect(sut.password).toEqual('other password');
    expect(typeof sut.name).toBe('string');
  });
  it('get createdAt method', () => {
    expect(sut.createdAt).toBeDefined();
    expect(sut.createdAt).toEqual(props.createdAt);
    expect(sut.createdAt).toBeInstanceOf(Date);
  });
  it('should update name field', () => {
    sut.update('new name');
    expect(sut.name).toEqual('new name');
    expect(typeof sut.name).toBe('string');
  });
  it('should update password field', () => {
    sut.updatePassword('new password');
    expect(sut.password).toEqual('new password');
    expect(typeof sut.password).toBe('string');
  });
});
