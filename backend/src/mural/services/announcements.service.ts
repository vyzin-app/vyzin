import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { QueryFilter } from '../../persistence/interfaces/find-options.interface';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { applyTextSearch } from '../../persistence/utils/text-search.util';
import { AnnouncementDTO } from '../dto/announcement.dto';
import { FilterAnnouncementsDTO } from '../dto/filter-announcements.dto';
import { Announcement } from '../entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async getAnnouncements(
    filter: FilterAnnouncementsDTO,
    currentUser: AuthenticatedUser,
  ): Promise<Announcement[]> {
    const filters: QueryFilter[] = [];

    if (filter.category) {
      filters.push({ field: 'category', op: '==', value: filter.category });
    }

    if (filter.isPinned !== undefined) {
      filters.push({ field: 'isPinned', op: '==', value: filter.isPinned });
    }

    if (filter.isImportant !== undefined) {
      filters.push({
        field: 'isImportant',
        op: '==',
        value: filter.isImportant,
      });
    }

    const results = await this.repositoryFactory
      .announcements({ user: currentUser })
      .findMany({ filters });

    return applyTextSearch(results, filter.search, [
      (announcement) => announcement.title,
      (announcement) => announcement.content,
    ]);
  }

  async getAnnouncementById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<Announcement> {
    return this.repositoryFactory
      .announcements({ user: currentUser })
      .findOneOrFail(id);
  }

  async createAnnouncement(
    dto: AnnouncementDTO,
    currentUser: AuthenticatedUser,
  ): Promise<string> {
    const announcement = await this.repositoryFactory
      .announcements({ user: currentUser })
      .createWithGeneratedId((id) => ({
        id,
        title: dto.title,
        content: dto.content,
        author: currentUser.uid,
        date: new Date(),
        category: dto.category,
        isPinned: dto.isPinned ?? false,
        isImportant: dto.isImportant ?? false,
        likes: 0,
        comments: 0,
      }));

    return announcement.id;
  }

  async updateAnnouncement(
    id: string,
    dto: AnnouncementDTO,
    currentUser: AuthenticatedUser,
  ): Promise<Announcement> {
    const repo = this.repositoryFactory.announcements({ user: currentUser });
    const existing = await repo.findOneOrFail(id);

    const announcement: Announcement = {
      ...existing,
      title: dto.title,
      content: dto.content,
      category: dto.category,
      isPinned: dto.isPinned ?? existing.isPinned,
      isImportant: dto.isImportant ?? existing.isImportant,
    };

    return repo.save(id, announcement);
  }

  async deleteAnnouncement(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.repositoryFactory
      .announcements({ user: currentUser })
      .delete(id);
  }
}
