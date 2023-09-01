import { UpdateUserUseCase } from '@/users/application/usecases/update-user.usecase';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto implements Omit<UpdateUserUseCase.Input, 'id'> {
  @IsNotEmpty()
  @IsString()
  name: string;
}
