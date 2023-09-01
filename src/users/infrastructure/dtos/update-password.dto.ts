import { UpdatePasswordUseCase } from '@/users/application/usecases/update-password.usecase';
import { IsNotEmpty, IsString } from 'class-validator';
export class UpdatePasswordDto
  implements Omit<UpdatePasswordUseCase.Input, 'id'>
{
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsString()
  oldPassword: string;
}
