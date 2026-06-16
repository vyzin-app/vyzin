import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppFunction } from '../../auth/functions/app-functions';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { ReservationStatusEnum } from '../entities/reservations.entity';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  const mockFactory = {
    reservations: jest.fn(() => ({
      createWithGeneratedId: jest.fn(async (build) => build('r1')),
    })),
    reservationsUnscoped: jest.fn(() => ({
      findMany: jest.fn().mockResolvedValue([]),
    })),
    usersUnscoped: jest.fn(() => ({
      findById: jest.fn().mockResolvedValue(null),
    })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: RepositoryFactory, useValue: mockFactory },
      ],
    }).compile();
    service = module.get(ReservationsService);
  });

  it('rejects reservation in the past', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await expect(
      service.createReservation(
        {
          space: 'Quadra Esportiva',
          date: yesterday,
          startTime: '10:00',
          endTime: '11:00',
          status: ReservationStatusEnum.CONFIRMED,
        },
        {
          uid: 'uid-resident',
          email: 'm@test.com',
          profileId: 'resident',
          functions: [AppFunction.RESERVATIONS_MANAGE],
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns configured spaces', () => {
    const spaces = service.getSpaces();
    expect(spaces.some((space) => space.name === 'Salão de Festas')).toBe(true);
  });
});
