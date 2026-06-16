import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireFunction } from '../decorators/require-function.decorator';
import { APP_FUNCTION_CATALOG, AppFunction } from '../functions/app-functions';
import { ApiSecured } from '../../swagger/api-secured.decorator';

@ApiTags('Functions')
@ApiSecured()
@Controller('functions')
export class FunctionsController {
  /** Catalog of all assignable functions, consumed by the profile screen. */
  @Get()
  @RequireFunction(AppFunction.PROFILES_READ)
  @ApiOperation({ summary: 'Lista catálogo de funções RBAC' })
  @ApiOkResponse({ description: 'Array de funções disponíveis para perfis' })
  list() {
    return APP_FUNCTION_CATALOG;
  }
}
