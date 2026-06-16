import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { CreateUserDTO } from '../dto/create-user.dto';
import { FilterUsersDTO } from '../dto/filter-users.dto';
import { UpdateUserDTO } from '../dto/update-user.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequireFunction(AppFunction.USERS_READ)
  async list(
    @Query() filter: FilterUsersDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.usersService.getUsers(filter, user);
  }

  @Get(':id')
  @RequireFunction(AppFunction.USERS_READ)
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.usersService.getUserById(id, user);
  }

  @Post()
  @RequireFunction(AppFunction.USERS_MANAGE)
  async create(@Body() dto: CreateUserDTO) {
    return await this.usersService.createUser(dto);
  }

  @Put(':id')
  @RequireFunction(AppFunction.USERS_MANAGE)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
    return await this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequireFunction(AppFunction.USERS_MANAGE)
  async delete(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }
}
