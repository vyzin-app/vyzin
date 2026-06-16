import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { QueryFilter } from '../../persistence/interfaces/find-options.interface';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { applyTextSearch } from '../../persistence/utils/text-search.util';
import { AnnouncementDTO } from '../dto/announcement.dto';
import { AnnouncementResponseDTO } from '../dto/announcement-response.dto';
import { FilterAnnouncementsDTO } from '../dto/filter-announcements.dto';
import { Announcement } from '../entities/announcement.entity';
import type { User } from '../../users/entities/user.entity';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async getAnnouncements(
    filter: FilterAnnouncementsDTO,
    currentUser: AuthenticatedUser,
  ): Promise<AnnouncementResponseDTO[]> {
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

    const enriched = await this.enrichWithAuthors(results);
    return applyTextSearch(enriched, filter.search, [
      (announcement) => announcement.title,
      (announcement) => announcement.content,
      (announcement) => announcement.authorDisplay,
    ]);
  }

  async getAnnouncementById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<AnnouncementResponseDTO> {
    const announcement = await this.repositoryFactory
      .announcements({ user: currentUser })
      .findOneOrFail(id);
    return this.enrichOneWithAuthor(announcement);
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
  ): Promise<AnnouncementResponseDTO> {
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

    return this.enrichOneWithAuthor(await repo.save(id, announcement));
  }

  private async enrichOneWithAuthor(
    announcement: Announcement,
  ): Promise<AnnouncementResponseDTO> {
    const [enriched] = await this.enrichWithAuthors([announcement]);
    return enriched;
  }

  private async enrichWithAuthors(
    announcements: Announcement[],
  ): Promise<AnnouncementResponseDTO[]> {
    const userMap = await this.loadUsersByIds(
      announcements.map((item) => item.author),
    );

    return announcements.map((announcement) => {
      const authorUser = userMap.get(announcement.author);
      const legacyLabel =
        announcement.author.includes(' ') ||
        announcement.author.includes('@') ||
        announcement.author.includes('—')
          ? announcement.author
          : undefined;

      return {
        ...announcement,
        authorName: authorUser?.name ?? legacyLabel ?? 'Usuario desconhecido',
        authorDisplay:
          authorUser?.name ??
          legacyLabel ??
          authorUser?.email ??
          'Usuario desconhecido',
      };
    });
  }

  private async loadUsersByIds(uids: string[]): Promise<Map<string, User>> {
    const uniqueIds = [...new Set(uids.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const entries = await Promise.all(
      uniqueIds.map(async (uid) => {
        const user = await this.repositoryFactory.usersUnscoped().findById(uid);
        return user ? ([uid, user] as const) : null;
      }),
    );

    return new Map(entries.filter((entry) => entry !== null));
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
