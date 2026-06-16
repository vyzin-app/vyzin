import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import { CondoInformationDTO } from '../dto/condo-information.dto';
import { InformationService } from '../services/information.service';
import { ApiSecured } from '../../swagger/api-secured.decorator';

@ApiTags('Information')
@ApiSecured()
@Controller('information')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  @Get()
  @RequireFunction(AppFunction.INFORMATION_READ)
  @ApiOperation({ summary: 'Obtém informações do condomínio (condoInformation/default)' })
  async getInformation() {
    return this.informationService.getInformation();
  }

  @Put()
  @RequireFunction(AppFunction.INFORMATION_EDIT)
  @ApiOperation({ summary: 'Atualiza informações do condomínio' })
  async updateInformation(@Body() dto: CondoInformationDTO) {
    return this.informationService.updateInformation(dto);
  }
}
