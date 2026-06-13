import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ProfilesService } from 'src/profiles/services/profiles.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import { UpdateUserDTO } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { userConverter } from '../mappers/user.converter';

@Injectable()
export class UsersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly profilesService: ProfilesService,
  ) {}

  private collection(): admin.firestore.CollectionReference<User> {
    return this.firebaseService
      .getFirestore()
      .collection('users')
      .withConverter(userConverter);
  }

  async getUsers(): Promise<User[]> {
    const snapshot = await this.collection().get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async getUserById(uid: string): Promise<User> {
    const snapshot = await this.collection().doc(uid).get();
    const user = snapshot.data();
    if (!user) {
      throw new NotFoundException(`User ${uid} not found`);
    }
    return user;
  }

  async createUser(dto: CreateUserDTO): Promise<User> {
    await this.profilesService.get(dto.profileId);

    let uid: string;
    try {
      const record = await this.firebaseService.getAuth().createUser({
        email: dto.email,
        password: dto.password,
        displayName: dto.name,
      });
      uid = record.uid;
    } catch (error) {
      throw new ConflictException(this.describeAuthError(error));
    }

    await this.firebaseService
      .getAuth()
      .setCustomUserClaims(uid, { profileId: dto.profileId });

    const user: User = {
      uid,
      name: dto.name,
      email: dto.email,
      cpf: dto.cpf,
      phone: dto.phone,
      apartment: dto.apartment,
      block: dto.block,
      profileId: dto.profileId,
    };
    await this.collection().doc(uid).set(user);
    return user;
  }

  async updateUser(uid: string, dto: UpdateUserDTO): Promise<User> {
    const existing = await this.getUserById(uid);
    await this.profilesService.get(dto.profileId);

    if (dto.profileId !== existing.profileId) {
      await this.firebaseService
        .getAuth()
        .setCustomUserClaims(uid, { profileId: dto.profileId });
    }

    const user: User = {
      uid,
      name: dto.name,
      email: existing.email,
      cpf: dto.cpf,
      phone: dto.phone,
      apartment: dto.apartment,
      block: dto.block,
      profileId: dto.profileId,
    };
    await this.collection().doc(uid).set(user);
    return user;
  }

  async deleteUser(uid: string): Promise<void> {
    await this.getUserById(uid);
    await this.firebaseService.getAuth().deleteUser(uid);
    await this.collection().doc(uid).delete();
  }

  /** Idempotent seed used by the bootstrap script. Returns the Firebase uid. */
  async ensureSeedUser(params: {
    email: string;
    password: string;
    name: string;
    cpf: string;
    phone: string;
    profileId: string;
    apartment?: string;
    block?: string;
  }): Promise<string> {
    const auth = this.firebaseService.getAuth();
    let uid: string;
    try {
      const existing = await auth.getUserByEmail(params.email);
      uid = existing.uid;
    } catch {
      const created = await auth.createUser({
        email: params.email,
        password: params.password,
        displayName: params.name,
      });
      uid = created.uid;
    }

    await auth.setCustomUserClaims(uid, { profileId: params.profileId });
    const user: User = {
      uid,
      name: params.name,
      email: params.email,
      cpf: params.cpf,
      phone: params.phone,
      apartment: params.apartment,
      block: params.block,
      profileId: params.profileId,
    };
    await this.collection().doc(uid).set(user);
    return uid;
  }

  private describeAuthError(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'auth/email-already-exists'
    ) {
      return 'Ja existe um usuario com este e-mail.';
    }
    return error instanceof Error ? error.message : 'Erro ao criar usuario.';
  }
}
