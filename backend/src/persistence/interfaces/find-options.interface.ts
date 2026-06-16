import type * as admin from 'firebase-admin';

export type WhereFilterOp = admin.firestore.WhereFilterOp;

export interface QueryFilter {
  field: string;
  op: WhereFilterOp;
  value: unknown;
}

export interface FindManyOptions {
  filters?: QueryFilter[];
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
}
