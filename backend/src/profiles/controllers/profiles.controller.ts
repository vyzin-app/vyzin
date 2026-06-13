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
import { ProfileDTO } from '../dto/profile.dto';
import { ProfilesService } from '../services/profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @RequireFunction(AppFunction.PROFILES_READ)
  async list() {
    return await this.profilesService.list();
  }

  @Get(':id')
  @RequireFunction(AppFunction.PROFILES_READ)
  async getById(@Param('id') id: string) {
    return await this.profilesService.get(id);
  }

  @Post()
  @RequireFunction(AppFunction.PROFILES_MANAGE)
  async create(@Body() dto: ProfileDTO) {
    return await this.profilesService.create(dto);
  }

  @Put(':id')
  @RequireFunction(AppFunction.PROFILES_MANAGE)
  async update(@Param('id') id: string, @Body() dto: ProfileDTO) {
    return await this.profilesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequireFunction(AppFunction.PROFILES_MANAGE)
  async delete(@Param('id') id: string) {
    await this.profilesService.delete(id);
  }
}
