import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import type { QueryFilter } from '../../persistence/interfaces/find-options.interface';
import { applyTextSearch } from '../../persistence/utils/text-search.util';
import { ProfilesService } from 'src/profiles/services/profiles.service';
import { FilterUsersDTO } from '../dto/filter-users.dto';
import { CreateUserDTO } from '../dto/create-user.dto';
import { UpdateUserDTO } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly profilesService: ProfilesService,
    private readonly repositoryFactory: RepositoryFactory,
  ) {}

  async getUsers(
    filter: FilterUsersDTO,
    currentUser: AuthenticatedUser,
  ): Promise<User[]> {
    const filters: QueryFilter[] = [];

    if (filter.profileId) {
      filters.push({ field: 'profileId', op: '==', value: filter.profileId });
    }

    const results = await this.repositoryFactory
      .users({ user: currentUser })
      .findMany({ filters });

    return applyTextSearch(results, filter.search, [
      (user) => user.name,
      (user) => user.email,
      (user) => user.cpf,
      (user) => user.phone,
      (user) => user.apartment,
      (user) => user.block,
    ]);
  }

  async getUserById(
    uid: string,
    currentUser: AuthenticatedUser,
  ): Promise<User> {
    return this.repositoryFactory
      .users({ user: currentUser })
      .findOneOrFail(uid);
  }

  /** Internal lookup without row-level scope (auth guard, seed). */
  async getUserByIdInternal(uid: string): Promise<User> {
    const user = await this.repositoryFactory.usersUnscoped().findById(uid);
    if (!user) {
      throw new NotFoundException(`User ${uid} not found`);
    }
    return user;
  }

  async createUser(
    dto: CreateUserDTO,
    currentUser?: AuthenticatedUser,
  ): Promise<User> {
    this.assertCanManageProfile(currentUser, dto.profileId);
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
    await this.repositoryFactory.usersUnscoped().create(user, uid);
    return user;
  }

  async updateUser(
    uid: string,
    dto: UpdateUserDTO,
    currentUser?: AuthenticatedUser,
  ): Promise<User> {
    const existing = await this.repositoryFactory
      .usersUnscoped()
      .findOneOrFail(uid);
    this.assertCanManageProfile(currentUser, dto.profileId, existing);
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
    await this.repositoryFactory.usersUnscoped().save(uid, user);
    return user;
  }

  async deleteUser(uid: string, currentUser?: AuthenticatedUser): Promise<void> {
    const existing = await this.repositoryFactory
      .usersUnscoped()
      .findOneOrFail(uid);
    this.assertCanManageProfile(currentUser, existing.profileId, existing);
    await this.firebaseService.getAuth().deleteUser(uid);
    await this.repositoryFactory.usersUnscoped().delete(uid);
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
    await this.repositoryFactory.usersUnscoped().save(uid, user);
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

  /** Porteiros may only manage users with the resident profile. */
  private assertCanManageProfile(
    currentUser: AuthenticatedUser | undefined,
    targetProfileId: string,
    existing?: User,
  ): void {
    if (!currentUser || currentUser.profileId !== 'doorman') {
      return;
    }

    if (targetProfileId !== 'resident') {
      throw new ForbiddenException(
        'Porteiros so podem cadastrar ou alterar usuarios com perfil Morador.',
      );
    }

    if (existing && existing.profileId !== 'resident') {
      throw new ForbiddenException(
        'Voce nao tem permissao para alterar este usuario.',
      );
    }
  }
}
