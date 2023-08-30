import { GetUserUseCase } from '@/users/application/usecases/getuser.usecase';
export class GetUserDto implements GetUserUseCase.Input {
  id: string;
}
