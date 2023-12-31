import { ValidationError } from '@/shared/domain/errors/validation-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { User } from '@prisma/client';

export class UserModelMapper {
  static toEntity(model: User): UserEntity {
    const data = {
      name: model.name,
      password: model.password,
      email: model.email,
      createdAt: model.createdAt,
    };
    try {
      return new UserEntity(data, model.id);
    } catch {
      throw new ValidationError(`An entity was not created`);
    }
  }
}
