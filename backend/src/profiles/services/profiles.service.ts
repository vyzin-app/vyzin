import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import {
  ALL_FUNCTIONS,
  AppFunction,
} from '../../auth/functions/app-functions';
import { ProfileDTO } from '../dto/profile.dto';
import { Profile } from '../entities/profile.entity';

/** Functions a system profile must always keep, to avoid locking everyone out. */
const LOCKOUT_GUARD_FUNCTIONS: AppFunction[] = [
  AppFunction.PROFILES_MANAGE,
  AppFunction.USERS_MANAGE,
];

@Injectable()
export class ProfilesService {
  private readonly cache = new Map<string, Profile>();

  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async list(currentUser: AuthenticatedUser): Promise<Profile[]> {
    return this.repositoryFactory.profiles({ user: currentUser }).findMany();
  }

  /** Reads a profile from Firestore (always fresh — permissions must not stay stale). */
  async get(id: string): Promise<Profile> {
    const profile = await this.repositoryFactory
      .profilesUnscoped()
      .findById(id);
    if (!profile) {
      throw new NotFoundException(`Profile ${id} not found`);
    }
    this.cache.set(id, profile);
    return profile;
  }

  async create(dto: ProfileDTO, currentUser: AuthenticatedUser): Promise<Profile> {
    const profile = await this.repositoryFactory
      .profiles({ user: currentUser })
      .createWithGeneratedId((id) => ({
        id,
        name: dto.name,
        description: dto.description ?? '',
        functions: dto.functions,
        isSystem: false,
      }));
    this.cache.set(profile.id, profile);
    return profile;
  }

  async update(
    id: string,
    dto: ProfileDTO,
    currentUser: AuthenticatedUser,
  ): Promise<Profile> {
    const repo = this.repositoryFactory.profiles({ user: currentUser });
    const existing = await repo.findOneOrFail(id);

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
    await repo.save(id, profile);
    this.cache.set(id, profile);
    return profile;
  }

  async delete(id: string, currentUser: AuthenticatedUser): Promise<void> {
    const repo = this.repositoryFactory.profiles({ user: currentUser });
    const existing = await repo.findOneOrFail(id);

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
    await repo.delete(id);
    this.cache.delete(id);
  }

  private async isInUse(profileId: string): Promise<boolean> {
    const users = await this.repositoryFactory.usersUnscoped().findMany({
      filters: [{ field: 'profileId', op: '==', value: profileId }],
      limit: 1,
    });
    return users.length > 0;
  }

  /**
   * Idempotent seed used by the bootstrap script.
   * Admin always receives the full catalog; other profiles merge new functions
   * so re-running seed picks up capabilities added after the first deploy.
   */
  async seedProfile(
    id: string,
    name: string,
    functions: AppFunction[],
    isSystem: boolean,
  ): Promise<void> {
    const repo = this.repositoryFactory.profilesUnscoped();
    const existing = await repo.findById(id);

    let finalFunctions: AppFunction[];
    if (id === 'admin') {
      finalFunctions = ALL_FUNCTIONS;
    } else if (existing) {
      finalFunctions = [...new Set([...existing.functions, ...functions])];
    } else {
      finalFunctions = functions;
    }

    const profile: Profile = {
      id,
      name,
      description: existing?.description ?? '',
      functions: finalFunctions,
      isSystem: existing?.isSystem ?? isSystem,
    };

    await repo.save(id, profile);
    this.cache.set(id, profile);
  }
}
