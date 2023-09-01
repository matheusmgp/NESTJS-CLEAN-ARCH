import { SigninUseCase } from '@/users/application/usecases/signin.usecase';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninDto implements SigninUseCase.Input {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
