import { UsersController } from '../../users.controller';
import { UserOutput } from '@/users/application/dtos/user-output';
import { SignupUseCase } from '@/users/application/usecases/signup.usecase';
import { SignupDto } from '../../dtos/signup.dto';

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
});
