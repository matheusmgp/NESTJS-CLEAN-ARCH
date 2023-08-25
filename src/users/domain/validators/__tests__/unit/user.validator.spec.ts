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
  });
  describe('Email field', () => {
    it('Invalidation cases for email field', () => {
      let isValid = sut.validate(null);
      expect(isValid).toBeFalsy();
      expect(sut.errors.email).toStrictEqual([
        'email must be an email',
        'email should not be empty',
        'email must be shorter than or equal to 100 characters',
      ]);

      isValid = sut.validate({ ...UserDataBuilder({}), email: '' as any });
      expect(isValid).toBeFalsy();
      expect(sut.errors.email).toStrictEqual([
        'email must be an email',
        'email should not be empty',
      ]);

      isValid = sut.validate({
        ...UserDataBuilder({}),
        email: 'long email test'.repeat(101),
      });
      expect(isValid).toBeFalsy();
      expect(sut.errors.email).toStrictEqual([
        'email must be an email',
        'email must be shorter than or equal to 100 characters',
      ]);
      isValid = sut.validate({
        ...UserDataBuilder({}),
        email: 10 as any,
      });
      expect(isValid).toBeFalsy();
      expect(sut.errors.email).toStrictEqual([
        'email must be an email',
        'email must be shorter than or equal to 100 characters',
      ]);
    });
  });

  describe('Name,Email,Password field ', () => {
    it('Valid cases for UserEntity', () => {
      const props = UserDataBuilder({});
      const isValid = sut.validate(props);
      expect(isValid).toBeTruthy();
      expect(sut.errors).toBeNull();
      expect(sut.validatedData).toStrictEqual(new UserRules(props));
    });
  });
});
