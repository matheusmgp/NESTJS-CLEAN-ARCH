import { UsersController } from '../../users.controller';
import { UserOutput } from '@/users/application/dtos/user-output';
import { SignupUseCase } from '@/users/application/usecases/signup.usecase';
import { SignupDto } from '../../dtos/signup.dto';
import { SigninDto } from '../../dtos/signin.dto';
import { SigninUseCase } from '@/users/application/usecases/signin.usecase';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { UpdateUserUseCase } from '@/users/application/usecases/update-user.usecase';
import { UpdatePasswordDto } from '../../dtos/update-password.dto';
import { UpdatePasswordUseCase } from '@/users/application/usecases/update-password.usecase';
import { GetUserUseCase } from '@/users/application/usecases/getuser.usecase';
import { ListUsersUseCase } from '@/users/application/usecases/get-users-list.usecase';
import { ListUsersDto } from '../../dtos/get-users-list.dto';

describe('UsersController unit test', () => {
  let sut: UsersController;
  let id: string;
  let props: UserOutput;

  beforeEach(async () => {
    sut = new UsersController();
    id = '7d649207-40e3-4e14-af22-395db5800683';
    props = {
      id,
      name: 'matheus',
      email: 'a@s.com',
      password: '1234',
      createdAt: new Date(),
    };
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });
  it('should create a user', async () => {
    const input: SignupDto = {
      name: 'matheus',
      email: 'a@s.com',
      password: '1234',
    };
    const output: SignupUseCase.Output = props;
    const mockSignupUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['signupUseCase'] = mockSignupUseCase as any;

    const result = await sut.create(input);
    expect(result).toStrictEqual(output);
    expect(mockSignupUseCase.execute).toHaveBeenCalledWith(input);
  });
  it('should authenticate', async () => {
    const input: SigninDto = {
      email: 'a@s.com',
      password: '1234',
    };
    const output: SigninUseCase.Output = props;
    const mockSigninUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['signinUseCase'] = mockSigninUseCase as any;

    const result = await sut.login(input);
    expect(result).toStrictEqual(output);
    expect(mockSigninUseCase.execute).toHaveBeenCalledWith(input);
  });
  it('should update an user', async () => {
    const input: UpdateUserDto = {
      name: 'matheus',
    };
    const output: UpdateUserUseCase.Output = props;
    const mockUpdateUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['updateUserUseCase'] = mockUpdateUserUseCase as any;

    const result = await sut.update(props.id, input);
    expect(result).toStrictEqual(output);
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    });
  });
  it('should update a password', async () => {
    const input: UpdatePasswordDto = {
      password: 'newpass',
      oldPassword: 'oldpass',
    };
    const output: UpdatePasswordUseCase.Output = props;
    const mockUpdatePasswordUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['updatePasswordUseCase'] = mockUpdatePasswordUseCase as any;

    const result = await sut.updatePassword(props.id, input);
    expect(result).toStrictEqual(output);
    expect(mockUpdatePasswordUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    });
  });
  it('should findOne user', async () => {
    const output: GetUserUseCase.Output = props;
    const mockGetUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['getUserUseCase'] = mockGetUserUseCase as any;

    const result = await sut.findOne(props.id);
    expect(result).toStrictEqual(output);
    expect(mockGetUserUseCase.execute).toHaveBeenCalledWith({ id });
  });
  it('should remove an user', async () => {
    const output = undefined;
    const mockDeleteUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['deleteUserUseCase'] = mockDeleteUserUseCase as any;
    await sut.remove(props.id);
    expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({ id });
  });
  it('should search for a list of users', async () => {
    const searchParams: ListUsersDto = {
      page: 1,
      perPage: 1,
      sort: null,
      sortDir: null,
      filter: null,
    };
    const output: ListUsersUseCase.Output = {
      items: [props],
      total: 1,
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
    };
    const mockListUsersUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['listUsersUseCase'] = mockListUsersUseCase as any;

    const result = await sut.search(searchParams);
    expect(result).toStrictEqual(output);
    expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(searchParams);
  });
});
