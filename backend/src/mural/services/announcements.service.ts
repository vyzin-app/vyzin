import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { AnnouncementDTO } from '../dto/announcement.dto';
import { FilterAnnouncementsDTO } from '../dto/filter-announcements.dto';
import { Announcement } from '../entities/announcement.entity';
import { announcementConverter } from '../mappers/announcement.converter';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection(): admin.firestore.CollectionReference<Announcement> {
    return this.firebaseService
      .getFirestore()
      .collection('announcements')
      .withConverter(announcementConverter);
  }

  async getAnnouncements(
    filter: FilterAnnouncementsDTO = {},
  ): Promise<Announcement[]> {
    let query: admin.firestore.Query<Announcement> = this.collection();

    if (filter.category) {
      query = query.where('category', '==', filter.category);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async getAnnouncementById(id: string): Promise<Announcement> {
    const snapshot = await this.collection().doc(id).get();
    const announcement = snapshot.data();
    if (!announcement) {
      throw new NotFoundException(`Announcement ${id} not found`);
    }
    return announcement;
  }

  async createAnnouncement(
    dto: AnnouncementDTO,
    currentUser: AuthenticatedUser,
  ): Promise<string> {
    const announcementRef = this.collection().doc();

    const announcement: Announcement = {
      id: announcementRef.id,
      title: dto.title,
      content: dto.content,
      author: currentUser.uid,
      date: new Date(),
      category: dto.category,
      isPinned: dto.isPinned ?? false,
      isImportant: dto.isImportant ?? false,
      likes: 0,
      comments: 0,
    };

    await announcementRef.set(announcement);
    return announcementRef.id;
  }

  async updateAnnouncement(
    id: string,
    dto: AnnouncementDTO,
  ): Promise<Announcement> {
    const existing = await this.getAnnouncementById(id);
    const announcement: Announcement = {
      ...existing,
      title: dto.title,
      content: dto.content,
      category: dto.category,
      isPinned: dto.isPinned ?? existing.isPinned,
      isImportant: dto.isImportant ?? existing.isImportant,
    };
    await this.collection().doc(id).set(announcement);
    return announcement;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await this.getAnnouncementById(id);
    await this.collection().doc(id).delete();
  }
}
