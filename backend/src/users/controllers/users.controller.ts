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
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { CreateUserDTO } from '../dto/create-user.dto';
import { FilterUsersDTO } from '../dto/filter-users.dto';
import { UpdateUserDTO } from '../dto/update-user.dto';
import { UsersService } from '../services/users.service';
import { ApiSecured } from '../../swagger/api-secured.decorator';

@ApiTags('Users')
@ApiSecured()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequireFunction(AppFunction.USERS_READ)
  @ApiOperation({ summary: 'Lista usuários (escopo por perfil)' })
  async list(
    @Query() filter: FilterUsersDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.usersService.getUsers(filter, user);
  }

  @Get(':id')
  @RequireFunction(AppFunction.USERS_READ)
  @ApiOperation({ summary: 'Busca usuário por UID' })
  @ApiParam({ name: 'id', description: 'Firebase UID' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.usersService.getUserById(id, user);
  }

  @Post()
  @RequireFunction(AppFunction.USERS_MANAGE)
  @ApiOperation({ summary: 'Cria usuário (Firebase Auth + Firestore)' })
  async create(
    @Body() dto: CreateUserDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.usersService.createUser(dto, user);
  }

  @Put(':id')
  @RequireFunction(AppFunction.USERS_MANAGE)
  @ApiOperation({ summary: 'Atualiza usuário' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.usersService.updateUser(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequireFunction(AppFunction.USERS_MANAGE)
  @ApiOperation({ summary: 'Remove usuário (Auth + Firestore)' })
  @ApiNoContentResponse()
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.usersService.deleteUser(id, user);
  }
}
