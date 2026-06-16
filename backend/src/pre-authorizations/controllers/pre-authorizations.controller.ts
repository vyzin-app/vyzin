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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { PreAuthorizationDTO } from '../dto/pre-authorization.dto';
import { PreAuthorizationsService } from '../services/pre-authorizations.service';
import { ApiSecured } from '../../swagger/api-secured.decorator';

@ApiTags('PreAuthorizations')
@ApiSecured()
@Controller('pre-authorizations')
export class PreAuthorizationsController {
  constructor(
    private readonly preAuthorizationsService: PreAuthorizationsService,
  ) {}

  @Get()
  @RequireFunction(AppFunction.VISITORS_READ)
  @ApiOperation({ summary: 'Lista pré-autorizados (escopo por createdBy)' })
  @ApiQuery({ name: 'search', required: false })
  async list(
    @Query('search') search: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.preAuthorizationsService.list(search, user);
  }

  @Get(':id')
  @RequireFunction(AppFunction.VISITORS_READ)
  @ApiOperation({ summary: 'Busca pré-autorizado por ID' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.preAuthorizationsService.getById(id, user);
  }

  @Post()
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  @ApiOperation({ summary: 'Cadastra pré-autorizado' })
  async create(
    @Body() dto: PreAuthorizationDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.preAuthorizationsService.create(dto, user);
  }

  @Put(':id')
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  @ApiOperation({ summary: 'Atualiza pré-autorizado' })
  async update(
    @Param('id') id: string,
    @Body() dto: PreAuthorizationDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.preAuthorizationsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  @ApiOperation({ summary: 'Remove pré-autorizado' })
  @ApiNoContentResponse()
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.preAuthorizationsService.remove(id, user);
  }
}
