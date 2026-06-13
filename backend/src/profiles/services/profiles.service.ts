import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AppFunction } from '../../auth/functions/app-functions';
import { ProfileDTO } from '../dto/profile.dto';
import { Profile } from '../entities/profile.entity';
import { profileConverter } from '../mappers/profile.converter';

/** Functions a system profile must always keep, to avoid locking everyone out. */
const LOCKOUT_GUARD_FUNCTIONS: AppFunction[] = [
  AppFunction.PROFILES_MANAGE,
  AppFunction.USERS_MANAGE,
];

@Injectable()
export class ProfilesService {
  private readonly cache = new Map<string, Profile>();

  constructor(private readonly firebaseService: FirebaseService) {}

  private collection(): admin.firestore.CollectionReference<Profile> {
    return this.firebaseService
      .getFirestore()
      .collection('profiles')
      .withConverter(profileConverter);
  }

  async list(): Promise<Profile[]> {
    const snapshot = await this.collection().get();
    return snapshot.docs.map((doc) => doc.data());
  }

  /** Reads a profile, using an in-memory cache to avoid a Firestore hit per request. */
  async get(id: string): Promise<Profile> {
    const cached = this.cache.get(id);
    if (cached) {
      return cached;
    }
    const snapshot = await this.collection().doc(id).get();
    const profile = snapshot.data();
    if (!profile) {
      throw new NotFoundException(`Profile ${id} not found`);
    }
    this.cache.set(id, profile);
    return profile;
  }

  async create(dto: ProfileDTO): Promise<Profile> {
    const ref = this.collection().doc();
    const profile: Profile = {
      id: ref.id,
      name: dto.name,
      description: dto.description ?? '',
      functions: dto.functions,
      isSystem: false,
    };
    await ref.set(profile);
    this.cache.set(ref.id, profile);
    return profile;
  }

  async update(id: string, dto: ProfileDTO): Promise<Profile> {
    const existing = await this.get(id);

    if (existing.isSystem) {
      const missing = LOCKOUT_GUARD_FUNCTIONS.filter(
        (fn) => !dto.functions.includes(fn),
      );
      if (missing.length > 0) {
        throw new BadRequestException(
          `O perfil de sistema "${existing.name}" nao pode perder as funcoes: ${missing.join(', ')}`,
        );
      }
    }

    const profile: Profile = {
      id,
      name: dto.name,
      description: dto.description ?? '',
      functions: dto.functions,
      isSystem: existing.isSystem,
    };
    await this.collection().doc(id).set(profile);
    this.cache.set(id, profile);
    return profile;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.get(id);
    if (existing.isSystem) {
      throw new BadRequestException(
        'Perfis de sistema nao podem ser excluidos.',
      );
    }
    if (await this.isInUse(id)) {
      throw new ConflictException(
        'Este perfil esta em uso por um ou mais usuarios e nao pode ser excluido.',
      );
    }
    await this.collection().doc(id).delete();
    this.cache.delete(id);
  }

  private async isInUse(profileId: string): Promise<boolean> {
    const snapshot = await this.firebaseService
      .getFirestore()
      .collection('users')
      .where('profileId', '==', profileId)
      .limit(1)
      .get();
    return !snapshot.empty;
  }

  /** Idempotent seed used by the bootstrap script. Keeps a deterministic id. */
  async seedProfile(
    id: string,
    name: string,
    functions: AppFunction[],
    isSystem: boolean,
  ): Promise<void> {
    const profile: Profile = { id, name, description: '', functions, isSystem };
    await this.collection().doc(id).set(profile);
    this.cache.set(id, profile);
  }
}
