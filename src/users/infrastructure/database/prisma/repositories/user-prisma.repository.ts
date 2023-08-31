import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { IUserRepository } from '@/users/domain/repositories/user.repository';
import { UserModelMapper } from '../models/user-model.mapper';

export class UserPrismaRepository implements IUserRepository.Repository {
  constructor(private readonly prismaService: PrismaService) {}
  sortableFields: string[] = ['name', 'createdAt'];
  async search(
    props: IUserRepository.SearchParams,
  ): Promise<IUserRepository.SearchResult> {
    const sortable = this.sortableFields?.includes(props.sort) || false;
    const orderByField = sortable ? props.sort : 'createdAt';
    const orderByDir = sortable ? props.sortDir : 'desc';

    const count = await this.prismaService.user.count({
      ...(props.filter && {
        where: {
          name: {
            contains: props.filter,
            mode: 'insensitive',
          },
        },
      }),
    });
    const models = await this.prismaService.user.findMany({
      ...(props.filter && {
        where: {
          name: {
            contains: props.filter,
            mode: 'insensitive',
          },
        },
      }),
      orderBy: {
        [orderByField]: orderByDir,
      },
      skip: props.page && props.page > 0 ? (props.page - 1) * props.perPage : 1,
      take: props.perPage && props.perPage > 0 ? props.perPage : 15,
    });

    return new IUserRepository.SearchResult({
      items: models.map(model => UserModelMapper.toEntity(model)),
      total: count,
      currentPage: props.page,
      perPage: props.perPage,
      sort: orderByField,
      sortDir: orderByDir,
      filter: props.filter,
    });
  }
  async insert(entity: UserEntity): Promise<void> {
    await this.prismaService.user.create({
      data: entity,
    });
  }
  async update(entity: UserEntity): Promise<void> {
    await this._get(entity.id);
    await this.prismaService.user.update({
      data: entity.toJSON(),
      where: {
        id: entity.id,
      },
    });
  }
  async findById(id: string): Promise<UserEntity> {
    return this._get(id);
  }
  async findAll(): Promise<UserEntity[]> {
    const models = await this.prismaService.user.findMany({});
    return models.map(model => UserModelMapper.toEntity(model));
  }
  async delete(id: string): Promise<void> {
    await this._get(id);
    await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }
  findByEmail(email: string): Promise<UserEntity> {
    throw new Error('Method not implemented.');
  }
  emailExists(email: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected async _get(id: string): Promise<UserEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });
      return UserModelMapper.toEntity(user);
    } catch {
      throw new NotFoundError(`UserModel not found using ID ${id}`);
    }
  }
}
