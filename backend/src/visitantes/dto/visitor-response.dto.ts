import { Visitor } from '../entities/visitor.entity';

/** Visitor payload returned by the API with creator/authorizer details resolved. */
export interface VisitorResponseDTO extends Visitor {
  createdByName: string;
  createdByEmail: string;
  createdByDisplay: string;
  authorizedByName: string;
  authorizedByDisplay: string;
}
