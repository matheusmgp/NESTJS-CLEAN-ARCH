import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  HttpCode,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SignupUseCase } from '../application/usecases/signup.usecase';
import { SigninUseCase } from '../application/usecases/signin.usecase';
import { ListUsersUseCase } from '../application/usecases/get-users-list.usecase';
import { GetUserUseCase } from '../application/usecases/getuser.usecase';
import { DeleteUserUseCase } from '../application/usecases/deleteuser.usecase';
import { UpdateUserUseCase } from '../application/usecases/update-user.usecase';
import { UpdatePasswordUseCase } from '../application/usecases/update-password.usecase';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { SigninDto } from './dtos/signin.dto';
import { ListUsersDto } from './dtos/get-users-list.dto';
import { UserOutput } from '../application/dtos/user-output';
import {
  UserCollectionPresenter,
  UserPresenter,
} from './presenters/user.presenter';
import { AuthService } from '@/auth/infrastructure/auth.service';
import { AuthGuard } from '@/auth/infrastructure/auth.guard';

@Controller('users')
export class UsersController {
  @Inject(SignupUseCase.UseCase)
  private signupUseCase: SignupUseCase.UseCase;
  @Inject(SigninUseCase.UseCase)
  private signinUseCase: SigninUseCase.UseCase;
  @Inject(ListUsersUseCase.UseCase)
  private listUsersUseCase: ListUsersUseCase.UseCase;
  @Inject(GetUserUseCase.UseCase)
  private getUserUseCase: GetUserUseCase.UseCase;
  @Inject(DeleteUserUseCase.UseCase)
  private deleteUserUseCase: DeleteUserUseCase.UseCase;
  @Inject(UpdateUserUseCase.UseCase)
  private updateUserUseCase: UpdateUserUseCase.UseCase;
  @Inject(UpdatePasswordUseCase.UseCase)
  private updatePasswordUseCase: UpdatePasswordUseCase.UseCase;

  @Inject(AuthService)
  private authService: AuthService;
  static userToResponse(output: UserOutput) {
    return new UserPresenter(output);
  }
  static listUsersToResponse(output: ListUsersUseCase.Output) {
    return new UserCollectionPresenter(output);
  }
  @HttpCode(201)
  @Post()
  async create(@Body() signupDto: SignupDto) {
    return UsersController.userToResponse(
      await this.signupUseCase.execute(signupDto),
    );
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() signinDto: SigninDto) {
    const output = await this.signinUseCase.execute(signinDto);
    return this.authService.generateJwt(output.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async search(@Query() searchParams: ListUsersDto) {
    return UsersController.listUsersToResponse(
      await this.listUsersUseCase.execute(searchParams),
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return UsersController.userToResponse(
      await this.getUserUseCase.execute({ id }),
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const outut = await this.updateUserUseCase.execute({
      id,
      name: updateUserDto.name,
    });
    return UsersController.userToResponse(outut);
  }
  @Patch(':id')
  @UseGuards(AuthGuard)
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const outut = await this.updatePasswordUseCase.execute({
      id,
      ...updatePasswordDto,
    });
    return UsersController.userToResponse(outut);
  }

  @HttpCode(204)
  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    await this.deleteUserUseCase.execute({ id });
  }
}
