import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ProfilesService } from 'src/profiles/services/profiles.service';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockFirebase = {
    getAuth: jest.fn(() => ({
      createUser: jest.fn(),
      setCustomUserClaims: jest.fn(),
    })),
  };

  const mockProfiles = {
    get: jest.fn().mockResolvedValue({ id: 'resident', functions: [] }),
  };

  const mockFactory = {
    usersUnscoped: jest.fn(() => ({
      create: jest.fn(),
      findOneOrFail: jest.fn(),
    })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: FirebaseService, useValue: mockFirebase },
        { provide: ProfilesService, useValue: mockProfiles },
        { provide: RepositoryFactory, useValue: mockFactory },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('blocks doorman from creating admin user', async () => {
    await expect(
      service.createUser(
        {
          name: 'Hacker',
          email: 'hacker@test.com',
          password: 'secret123',
          cpf: '000.000.000-00',
          phone: '(61) 90000-0000',
          profileId: 'admin',
        },
        {
          uid: 'uid-doorman',
          email: 'porteiro@test.com',
          profileId: 'doorman',
          functions: [],
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
