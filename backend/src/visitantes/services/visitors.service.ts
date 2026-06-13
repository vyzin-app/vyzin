import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { VisitorDTO } from '../dto/visitor.dto';
import { UpdateVisitorStatusDTO } from '../dto/update-visitor-status.dto';
import { FilterVisitorsDTO } from '../dto/filter-visitors.dto';
import {
  Visitor,
  VisitorStatusEnum,
} from '../entities/visitor.entity';
import { visitorConverter } from '../mappers/visitor.converter';

@Injectable()
export class VisitorsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection(): admin.firestore.CollectionReference<Visitor> {
    return this.firebaseService
      .getFirestore()
      .collection('visitors')
      .withConverter(visitorConverter);
  }

  async getVisitors(filter: FilterVisitorsDTO = {}): Promise<Visitor[]> {
    let query: admin.firestore.Query<Visitor> = this.collection();

    if (filter.status) {
      query = query.where('status', '==', filter.status);
    }

    if (filter.visitType) {
      query = query.where('visitType', '==', filter.visitType);
    }

    if (filter.date) {
      const startOfDay = new Date(filter.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filter.date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query
        .where('date', '>=', startOfDay)
        .where('date', '<=', endOfDay);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async getVisitorById(id: string): Promise<Visitor> {
    const snapshot = await this.collection().doc(id).get();
    const visitor = snapshot.data();
    if (!visitor) {
      throw new NotFoundException(`Visitor ${id} not found`);
    }
    return visitor;
  }

  async createVisitor(
    dto: VisitorDTO,
    currentUser: AuthenticatedUser,
  ): Promise<string> {
    const visitorRef = this.collection().doc();

    const visitor: Visitor = {
      id: visitorRef.id,
      name: dto.name,
      cpf: dto.cpf,
      phone: dto.phone,
      email: dto.email ?? '',
      purpose: dto.purpose,
      date: dto.date,
      time: dto.time,
      notes: dto.notes ?? '',
      visitType: dto.visitType,
      status: dto.status ?? VisitorStatusEnum.WAITING,
      authorizedBy: currentUser.uid,
      exitTime: dto.exitTime,
    };

    await visitorRef.set(visitor);
    return visitorRef.id;
  }

  async updateVisitor(id: string, dto: VisitorDTO): Promise<Visitor> {
    const existing = await this.getVisitorById(id);
    const visitor: Visitor = {
      ...existing,
      name: dto.name,
      cpf: dto.cpf,
      phone: dto.phone,
      email: dto.email ?? '',
      purpose: dto.purpose,
      date: dto.date,
      time: dto.time,
      notes: dto.notes ?? '',
      visitType: dto.visitType,
      status: dto.status ?? existing.status,
      exitTime: dto.exitTime ?? existing.exitTime,
    };
    await this.collection().doc(id).set(visitor);
    return visitor;
  }

  /** Workflow transition (authorize / deny / register exit). */
  async updateStatus(
    id: string,
    dto: UpdateVisitorStatusDTO,
    currentUser: AuthenticatedUser,
  ): Promise<Visitor> {
    const existing = await this.getVisitorById(id);
    const visitor: Visitor = {
      ...existing,
      status: dto.status,
      authorizedBy: currentUser.uid,
      exitTime:
        dto.status === VisitorStatusEnum.EXITED
          ? (dto.exitTime ?? existing.exitTime)
          : existing.exitTime,
    };
    await this.collection().doc(id).set(visitor);
    return visitor;
  }

  async deleteVisitor(id: string): Promise<void> {
    await this.getVisitorById(id);
    await this.collection().doc(id).delete();
  }
}
