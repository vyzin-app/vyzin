import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { INFORMATION_DOCUMENT_ID } from '../entities/condo-information.entity';
import { InformationService } from './information.service';

describe('InformationService', () => {
  let service: InformationService;
  const mockRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const mockFactory = {
    informationUnscoped: jest.fn(() => mockRepo),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InformationService,
        { provide: RepositoryFactory, useValue: mockFactory },
      ],
    }).compile();
    service = module.get(InformationService);
  });

  it('throws when information is not configured', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getInformation()).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns stored information', async () => {
    const info = {
      id: INFORMATION_DOCUMENT_ID,
      contacts: [],
      rules: [],
      documents: [],
      address: {
        name: 'Residencial Vyzin',
        street: 'Rua das Flores',
        number: '1234',
        neighborhood: 'Jardim',
        city: 'Brasília',
        state: 'DF',
        zipCode: '01234-567',
      },
    };
    mockRepo.findById.mockResolvedValue(info);
    await expect(service.getInformation()).resolves.toEqual(info);
  });

  it('updates information document', async () => {
    const dto = {
      contacts: [],
      rules: [],
      documents: [],
      address: {
        name: 'Residencial Vyzin',
        street: 'Rua A',
        number: '1',
        neighborhood: 'Centro',
        city: 'Brasília',
        state: 'DF',
        zipCode: '00000-000',
      },
    };
    mockRepo.save.mockImplementation(async (_id, data) => data);

    const result = await service.updateInformation(dto);
    expect(result.id).toBe(INFORMATION_DOCUMENT_ID);
    expect(mockRepo.save).toHaveBeenCalledWith(
      INFORMATION_DOCUMENT_ID,
      expect.objectContaining({ address: dto.address }),
    );
  });
});
