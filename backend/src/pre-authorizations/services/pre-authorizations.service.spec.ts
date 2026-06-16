import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { PreAuthorizationsService } from './pre-authorizations.service';

describe('PreAuthorizationsService', () => {
  let service: PreAuthorizationsService;
  const mockRepo = {
    findMany: jest.fn(),
    findOneOrFail: jest.fn(),
    createWithGeneratedId: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const mockFactory = {
    preAuthorizations: jest.fn(() => mockRepo),
  };

  const resident = {
    uid: 'uid-resident',
    email: 'm@test.com',
    profileId: 'resident',
    functions: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreAuthorizationsService,
        { provide: RepositoryFactory, useValue: mockFactory },
      ],
    }).compile();
    service = module.get(PreAuthorizationsService);
  });

  it('creates pre-authorization with createdBy', async () => {
    mockRepo.createWithGeneratedId.mockImplementation(async (build) =>
      build('pa1'),
    );

    const id = await service.create(
      {
        name: 'Diarista',
        cpf: '111',
        schedule: 'Segunda 08:00',
        validUntil: '2026-12-31',
      },
      resident,
    );

    expect(id).toBe('pa1');
    const buildFn = mockRepo.createWithGeneratedId.mock.calls[0][0];
    const built = buildFn('pa1');
    expect(built.createdBy).toBe('uid-resident');
    expect(built.active).toBe(true);
  });

  it('removes pre-authorization', async () => {
    mockRepo.delete.mockResolvedValue(undefined);
    await service.remove('pa1', resident);
    expect(mockRepo.delete).toHaveBeenCalledWith('pa1');
  });
});
