import { Body, Controller, Get, Put } from '@nestjs/common';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import { CondoInformationDTO } from '../dto/condo-information.dto';
import { InformationService } from '../services/information.service';

@Controller('information')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  @Get()
  @RequireFunction(AppFunction.INFORMATION_READ)
  async getInformation() {
    return this.informationService.getInformation();
  }

  @Put()
  @RequireFunction(AppFunction.INFORMATION_EDIT)
  async updateInformation(@Body() dto: CondoInformationDTO) {
    return this.informationService.updateInformation(dto);
  }
}
