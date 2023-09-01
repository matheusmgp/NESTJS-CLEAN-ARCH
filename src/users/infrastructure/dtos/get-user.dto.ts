import { GetUserUseCase } from '@/users/application/usecases/getuser.usecase';
import { IsNotEmpty, IsString } from 'class-validator';
export class GetUserDto implements GetUserUseCase.Input {
  @IsNotEmpty()
  @IsString()
  id: string;
}
