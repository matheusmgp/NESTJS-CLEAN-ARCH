import { SignupUseCase } from '@/users/application/usecases/signup.usecase';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto implements SignupUseCase.Input {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
