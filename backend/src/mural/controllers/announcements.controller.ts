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
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { AnnouncementsService } from '../services/announcements.service';
import { AnnouncementDTO } from '../dto/announcement.dto';
import { FilterAnnouncementsDTO } from '../dto/filter-announcements.dto';
import { ApiSecured } from '../../swagger/api-secured.decorator';

@ApiTags('Announcements')
@ApiSecured()
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @RequireFunction(AppFunction.ANNOUNCEMENTS_READ)
  @ApiOperation({ summary: 'Lista avisos do mural' })
  async getAnnouncements(
    @Query() filter: FilterAnnouncementsDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.announcementsService.getAnnouncements(filter, user);
  }

  @Get(':id')
  @RequireFunction(AppFunction.ANNOUNCEMENTS_READ)
  @ApiOperation({ summary: 'Busca aviso por ID' })
  async getAnnouncement(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.announcementsService.getAnnouncementById(id, user);
  }

  @Post()
  @RequireFunction(AppFunction.ANNOUNCEMENTS_MANAGE)
  @ApiOperation({ summary: 'Publica aviso' })
  async createAnnouncement(
    @Body() announcement: AnnouncementDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.announcementsService.createAnnouncement(
      announcement,
      user,
    );
  }

  @Put(':id')
  @RequireFunction(AppFunction.ANNOUNCEMENTS_MANAGE)
  @ApiOperation({ summary: 'Atualiza aviso' })
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() announcement: AnnouncementDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.announcementsService.updateAnnouncement(
      id,
      announcement,
      user,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @RequireFunction(AppFunction.ANNOUNCEMENTS_MANAGE)
  @ApiOperation({ summary: 'Remove aviso' })
  @ApiNoContentResponse()
  async deleteAnnouncement(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.announcementsService.deleteAnnouncement(id, user);
  }
}
