export interface User {
  /** Firebase Auth uid, also the Firestore document id. */
  uid: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  apartment?: string;
  block?: string;
  profileId: string;
}
