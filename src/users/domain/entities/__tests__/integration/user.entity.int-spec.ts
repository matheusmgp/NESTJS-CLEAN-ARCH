import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UserEntity, UserProps } from '../../user.entity';
import { EntityValidationError } from '@/shared/domain/errors/validation-error';

describe('UserEntity integration tests', () => {
  describe('Constructor method', () => {
    it('should throw an error when instantiating a user with invalid name', () => {
      let props: UserProps = {
        ...UserDataBuilder({}),
        name: null,
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);

      props = {
        ...UserDataBuilder({}),
        name: '',
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
      props = {
        ...UserDataBuilder({}),
        name: 's'.repeat(101),
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
      props = {
        ...UserDataBuilder({}),
        name: 10 as any,
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
    });
    it('should throw an error when instantiating a user with invalid email', () => {
      let props: UserProps = {
        ...UserDataBuilder({}),
        email: null,
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);

      props = {
        ...UserDataBuilder({}),
        email: '',
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
      props = {
        ...UserDataBuilder({}),
        email: 's'.repeat(101),
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
      props = {
        ...UserDataBuilder({}),
        email: 10 as any,
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
    });
    it('should throw an error when instantiating a user with invalid password', () => {
      let props: UserProps = {
        ...UserDataBuilder({}),
        password: null,
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);

      props = {
        ...UserDataBuilder({}),
        password: '',
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
      props = {
        ...UserDataBuilder({}),
        password: 's'.repeat(101),
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
      props = {
        ...UserDataBuilder({}),
        password: 10 as any,
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
    });
    it('should throw an error when instantiating a user with invalid createdAt', () => {
      let props: UserProps = {
        ...UserDataBuilder({}),
        createdAt: 'notValidEmail' as any,
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
      props = {
        ...UserDataBuilder({}),
        createdAt: 10 as any,
      };
      expect(() => {
        new UserEntity(props);
      }).toThrowError(EntityValidationError);
    });
    it('should instantiate a valid user', () => {
      expect.assertions(0);
      const props: UserProps = {
        ...UserDataBuilder({}),
      };
      new UserEntity(props);
    });
  });

  describe('Update method', () => {
    it('should throw an error when updating a user with invalid name', () => {
      const entity = new UserEntity(UserDataBuilder({}));

      expect(() => entity.update(null)).toThrowError(EntityValidationError);
      expect(() => entity.update('')).toThrowError(EntityValidationError);
      expect(() => entity.update(10 as any)).toThrowError(
        EntityValidationError,
      );
      expect(() => entity.update('ss'.repeat(101))).toThrowError(
        EntityValidationError,
      );
    });
    it('should update a user with success', () => {
      expect.assertions(0);
      const props: UserProps = {
        ...UserDataBuilder({}),
      };
      const entity = new UserEntity(props);
      entity.update('valid name');
    });
  });
  describe('Update method', () => {
    it('should throw an error when updating a user with invalid password', () => {
      const entity = new UserEntity(UserDataBuilder({}));

      expect(() => entity.updatePassword(null)).toThrowError(
        EntityValidationError,
      );
      expect(() => entity.updatePassword('')).toThrowError(
        EntityValidationError,
      );
      expect(() => entity.updatePassword(10 as any)).toThrowError(
        EntityValidationError,
      );
      expect(() => entity.updatePassword('pass'.repeat(101))).toThrowError(
        EntityValidationError,
      );
    });
    it('should update a user with success', () => {
      expect.assertions(0);
      const props: UserProps = {
        ...UserDataBuilder({}),
      };
      const entity = new UserEntity(props);
      entity.updatePassword('valid pass');
    });
  });
});
