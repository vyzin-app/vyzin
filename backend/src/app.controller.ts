import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Healthcheck da API' })
  @ApiOkResponse({ description: 'Mensagem de boas-vindas' })
  getHello(): string {
    return this.appService.getHello();
  }
}
