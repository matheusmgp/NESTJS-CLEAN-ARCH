import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import {
  UserRules,
  UserValidator,
  UserValidatorFactory,
} from '../../user.validator';

describe('UserValidator unit tests ', () => {
  let sut: UserValidator;
  beforeEach(() => {
    sut = UserValidatorFactory.create();
  });
  describe('Name field', () => {
    it('InValid cases for name field', () => {
      let isValid = sut.validate(null);
      expect(isValid).toBeFalsy();
      expect(sut.errors.name).toStrictEqual([
        'name must be a string',
        'name should not be empty',
        'name must be shorter than or equal to 100 characters',
      ]);

      isValid = sut.validate({ ...UserDataBuilder({}), name: '' as any });
      expect(isValid).toBeFalsy();
      expect(sut.errors.name).toStrictEqual(['name should not be empty']);

      isValid = sut.validate({
        ...UserDataBuilder({}),
        name: 'test'.repeat(101),
      });
      expect(isValid).toBeFalsy();
      expect(sut.errors.name).toStrictEqual([
        'name must be shorter than or equal to 100 characters',
      ]);
      isValid = sut.validate({
        ...UserDataBuilder({}),
        name: 10 as any,
      });
      expect(isValid).toBeFalsy();
      expect(sut.errors.name).toStrictEqual([
        'name must be a string',
        'name must be shorter than or equal to 100 characters',
      ]);
    });
    it('Valid cases for name field', () => {
      const props = UserDataBuilder({});
      const isValid = sut.validate(props);
      expect(isValid).toBeTruthy();
      expect(sut.errors).toBeNull();
      expect(sut.validatedData).toStrictEqual(new UserRules(props));
    });
  });
  describe('Password field', () => {
    it('Invalidation cases for password field', () => {
      let isValid = sut.validate(null);
      expect(isValid).toBeFalsy();
      expect(sut.errors.password).toStrictEqual([
        'password must be a string',
        'password should not be empty',
        'password must be shorter than or equal to 100 characters',
      ]);

      isValid = sut.validate({ ...UserDataBuilder({}), password: '' as any });
      expect(isValid).toBeFalsy();
      expect(sut.errors.password).toStrictEqual([
        'password should not be empty',
      ]);

      isValid = sut.validate({
        ...UserDataBuilder({}),
        password: 'long password test'.repeat(101),
      });
      expect(isValid).toBeFalsy();
      expect(sut.errors.password).toStrictEqual([
        'password must be shorter than or equal to 100 characters',
      ]);
      isValid = sut.validate({
        ...UserDataBuilder({}),
        password: 10 as any,
      });
      expect(isValid).toBeFalsy();
      expect(sut.errors.password).toStrictEqual([
        'password must be a string',
        'password must be shorter than or equal to 100 characters',
      ]);
    });
    it('Valid cases for password field', () => {
      const props = UserDataBuilder({});
      const isValid = sut.validate(props);
      expect(isValid).toBeTruthy();
      expect(sut.errors).toBeNull();
      expect(sut.validatedData).toStrictEqual(new UserRules(props));
    });
  });
});
