import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import { CreateUserDTO } from '../dto/create-user.dto';
import { UpdateUserDTO } from '../dto/update-user.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequireFunction(AppFunction.USERS_READ)
  async list() {
    return await this.usersService.getUsers();
  }

  @Get(':id')
  @RequireFunction(AppFunction.USERS_READ)
  async getById(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
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
