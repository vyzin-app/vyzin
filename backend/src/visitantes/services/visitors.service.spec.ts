import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import {
  VisitorStatusEnum,
  VisitTypeEnum,
} from '../entities/visitor.entity';
import { VisitorsService } from './visitors.service';

describe('VisitorsService', () => {
  let service: VisitorsService;
  const mockRepo = {
    findMany: jest.fn(),
    findOneOrFail: jest.fn(),
    createWithGeneratedId: jest.fn(),
    save: jest.fn(),
  };
  const mockFactory = {
    visitors: jest.fn(() => mockRepo),
    usersUnscoped: jest.fn(() => ({
      findById: jest.fn().mockResolvedValue({
        uid: 'uid-resident',
        name: 'Maria',
        email: 'maria@test.com',
      }),
    })),
  };

  const resident: AuthenticatedUser = {
    uid: 'uid-resident',
    email: 'maria@test.com',
    profileId: 'resident',
    functions: [AppFunction.VISITORS_MANAGE],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitorsService,
        { provide: RepositoryFactory, useValue: mockFactory },
      ],
    }).compile();

    service = module.get(VisitorsService);
  });

  it('creates visitor with createdBy and empty authorizedBy when waiting', async () => {
    mockRepo.createWithGeneratedId.mockImplementation(async (build) => {
      const visitor = build('v1');
      return visitor;
    });

    const id = await service.createVisitor(
      {
        name: 'João',
        cpf: '111',
        phone: '999',
        purpose: 'Visita',
        date: new Date('2026-07-01'),
        time: '10:00',
        visitType: VisitTypeEnum.APARTMENT,
      },
      resident,
    );

    expect(id).toBe('v1');
    expect(mockRepo.createWithGeneratedId).toHaveBeenCalled();
    const buildFn = mockRepo.createWithGeneratedId.mock.calls[0][0];
    const built = buildFn('v1');
    expect(built.createdBy).toBe('uid-resident');
    expect(built.authorizedBy).toBe('');
    expect(built.status).toBe(VisitorStatusEnum.WAITING);
  });

  it('updateStatus sets authorizedBy to workflow operator', async () => {
    mockRepo.findOneOrFail.mockResolvedValue({
      id: 'v1',
      createdBy: 'uid-resident',
      authorizedBy: '',
      status: VisitorStatusEnum.WAITING,
    });
    mockRepo.save.mockImplementation(async (_id, entity) => entity);

    const result = await service.updateStatus(
      'v1',
      { status: VisitorStatusEnum.AUTHORIZED },
      {
        uid: 'uid-doorman',
        email: 'porteiro@test.com',
        profileId: 'doorman',
        functions: [AppFunction.VISITORS_WORKFLOW],
      },
    );

    expect(result.authorizedBy).toBe('uid-doorman');
    expect(result.createdBy).toBe('uid-resident');
  });

  it('rejects visitor in the past', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await expect(
      service.createVisitor(
        {
          name: 'João',
          cpf: '111',
          phone: '999',
          purpose: 'Visita',
          date: yesterday,
          time: '10:00',
          visitType: VisitTypeEnum.APARTMENT,
        },
        resident,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
