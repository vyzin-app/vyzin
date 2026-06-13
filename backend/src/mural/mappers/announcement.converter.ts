import * as admin from 'firebase-admin';
import {
  Announcement,
  AnnouncementCategoryEnum,
} from '../entities/announcement.entity';

const { Timestamp } = admin.firestore;

/**
 * Bridges the typed domain `Announcement` and the raw Firestore document.
 * `date` is stored as a `Timestamp` and `id` stays out of the document body
 * (it is the document key).
 */
export const announcementConverter: admin.firestore.FirestoreDataConverter<Announcement> =
  {
    toFirestore(
      announcement: admin.firestore.WithFieldValue<Announcement>,
    ): admin.firestore.DocumentData {
      const data = announcement as Announcement;
      return {
        title: data.title,
        content: data.content,
        author: data.author,
        date: Timestamp.fromDate(data.date),
        category: data.category,
        isPinned: data.isPinned,
        isImportant: data.isImportant,
        likes: data.likes,
        comments: data.comments,
      };
    },

    fromFirestore(snapshot: admin.firestore.QueryDocumentSnapshot): Announcement {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        title: data.title as string,
        content: data.content as string,
        author: data.author as string,
        date: (data.date as admin.firestore.Timestamp).toDate(),
        category: data.category as AnnouncementCategoryEnum,
        isPinned: data.isPinned as boolean,
        isImportant: data.isImportant as boolean,
        likes: data.likes as number,
        comments: data.comments as number,
      };
    },
  };
