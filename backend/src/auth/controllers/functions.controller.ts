import { Controller, Get } from '@nestjs/common';
import { RequireFunction } from '../decorators/require-function.decorator';
import { APP_FUNCTION_CATALOG, AppFunction } from '../functions/app-functions';

@Controller('functions')
export class FunctionsController {
  /** Catalog of all assignable functions, consumed by the profile screen. */
  @Get()
  @RequireFunction(AppFunction.PROFILES_READ)
  list() {
    return APP_FUNCTION_CATALOG;
  }
}
