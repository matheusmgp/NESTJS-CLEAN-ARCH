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
  static userToResponse(output: UserOutput) {
    return new UserPresenter(output);
  }
  static listUsersToResponse(output: ListUsersUseCase.Output) {
    return new UserCollectionPresenter(output);
  }
  @HttpCode(200)
  @Post()
  async create(@Body() signupDto: SignupDto) {
    return UsersController.userToResponse(
      await this.signupUseCase.execute(signupDto),
    );
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() signinDto: SigninDto) {
    return UsersController.userToResponse(
      await this.signinUseCase.execute(signinDto),
    );
  }

  @Get()
  async search(@Query() searchParams: ListUsersDto) {
    return UsersController.listUsersToResponse(
      await this.listUsersUseCase.execute(searchParams),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return UsersController.userToResponse(
      await this.getUserUseCase.execute({ id }),
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const outut = await this.updateUserUseCase.execute({
      id,
      name: updateUserDto.name,
    });
    return UsersController.userToResponse(outut);
  }
  @Patch(':id')
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
  async remove(@Param('id') id: string) {
    await this.deleteUserUseCase.execute({ id });
  }
}
