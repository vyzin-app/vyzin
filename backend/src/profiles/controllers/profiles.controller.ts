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
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { ProfileDTO } from '../dto/profile.dto';
import { ProfilesService } from '../services/profiles.service';
import { ApiSecured } from '../../swagger/api-secured.decorator';

@ApiTags('Profiles')
@ApiSecured()
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @RequireFunction(AppFunction.PROFILES_READ)
  @ApiOperation({ summary: 'Lista perfis RBAC' })
  async list(@CurrentUser() user: AuthenticatedUser) {
    return await this.profilesService.list(user);
  }

  @Get(':id')
  @RequireFunction(AppFunction.PROFILES_READ)
  @ApiOperation({ summary: 'Busca perfil por ID' })
  @ApiParam({ name: 'id', example: 'admin' })
  async getById(@Param('id') id: string) {
    return await this.profilesService.get(id);
  }

  @Post()
  @RequireFunction(AppFunction.PROFILES_MANAGE)
  @ApiOperation({ summary: 'Cria perfil customizado' })
  async create(
    @Body() dto: ProfileDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.profilesService.create(dto, user);
  }

  @Put(':id')
  @RequireFunction(AppFunction.PROFILES_MANAGE)
  @ApiOperation({ summary: 'Atualiza perfil' })
  @ApiParam({ name: 'id', example: 'admin' })
  async update(
    @Param('id') id: string,
    @Body() dto: ProfileDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.profilesService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequireFunction(AppFunction.PROFILES_MANAGE)
  @ApiOperation({ summary: 'Remove perfil (bloqueado se isSystem ou com usuários)' })
  @ApiNoContentResponse({ description: 'Perfil removido' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.profilesService.delete(id, user);
  }
}
