import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { CondoInformationDTO } from '../dto/condo-information.dto';
import {
  CondoInformation,
  INFORMATION_DOCUMENT_ID,
} from '../entities/condo-information.entity';

@Injectable()
export class InformationService {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async getInformation(): Promise<CondoInformation> {
    const repo = this.repositoryFactory.informationUnscoped();
    const info = await repo.findById(INFORMATION_DOCUMENT_ID);
    if (!info) {
      throw new NotFoundException(
        'Informacoes do condominio ainda nao foram configuradas.',
      );
    }
    return info;
  }

  async updateInformation(dto: CondoInformationDTO): Promise<CondoInformation> {
    const repo = this.repositoryFactory.informationUnscoped();
    const info: CondoInformation = {
      id: INFORMATION_DOCUMENT_ID,
      contacts: dto.contacts,
      rules: dto.rules,
      documents: dto.documents,
      address: dto.address,
      notice: dto.notice,
    };
    return repo.save(INFORMATION_DOCUMENT_ID, info);
  }

  /** Idempotent seed used by bootstrap script. */
  async seedInformation(data: Omit<CondoInformation, 'id'>): Promise<void> {
    const repo = this.repositoryFactory.informationUnscoped();
    await repo.save(INFORMATION_DOCUMENT_ID, {
      id: INFORMATION_DOCUMENT_ID,
      ...data,
    });
  }
}
