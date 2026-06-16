import { NotFoundException } from '@nestjs/common';
import type * as admin from 'firebase-admin';
import { FirebaseService } from '../../firebase/firebase.service';
import type { CollectionDefinition } from '../interfaces/collection-definition.interface';
import type { FindManyOptions } from '../interfaces/find-options.interface';
import type { IRepository } from '../interfaces/repository.interface';

/**
 * Generic Firestore ORM — one implementation reused by every entity collection.
 */
export class FirestoreRepository<T> implements IRepository<T> {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly definition: CollectionDefinition<T>,
  ) {}

  private collection(): admin.firestore.CollectionReference<T> {
    return this.firebaseService
      .getFirestore()
      .collection(this.definition.name)
      .withConverter(this.definition.converter);
  }

  private applyFilters(
    query: admin.firestore.Query<T>,
    options?: FindManyOptions,
  ): admin.firestore.Query<T> {
    let result = query;

    for (const filter of options?.filters ?? []) {
      result = result.where(filter.field, filter.op, filter.value);
    }

    if (options?.orderBy) {
      result = result.orderBy(
        options.orderBy.field,
        options.orderBy.direction,
      );
    }

    if (options?.limit !== undefined) {
      result = result.limit(options.limit);
    }

    return result;
  }

  async findById(id: string): Promise<T | null> {
    const snapshot = await this.collection().doc(id).get();
    return snapshot.data() ?? null;
  }

  async findOneOrFail(id: string): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundException(
        `${this.definition.name} document ${id} not found`,
      );
    }
    return entity;
  }

  async findMany(options?: FindManyOptions): Promise<T[]> {
    const snapshot = await this.applyFilters(this.collection(), options).get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async create(entity: T, id?: string): Promise<T> {
    const documentId = id ?? this.definition.getId(entity);
    await this.collection().doc(documentId).set(entity);
    return entity;
  }

  /** Creates a document with a Firestore-generated id. */
  async createWithGeneratedId(build: (id: string) => T): Promise<T> {
    const ref = this.collection().doc();
    const entity = build(ref.id);
    await ref.set(entity);
    return entity;
  }

  async save(id: string, entity: T): Promise<T> {
    await this.collection().doc(id).set(entity);
    return entity;
  }

  async update(id: string, partial: Partial<T>): Promise<T> {
    const existing = await this.findOneOrFail(id);
    const updated = { ...existing, ...partial };
    await this.save(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findOneOrFail(id);
    await this.collection().doc(id).delete();
  }
}
