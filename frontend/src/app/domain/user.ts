/**
 * Cosmetic role kept for dashboard display only. Real authorization is driven
 * by the profile's functions (see AppFunction), not by this value.
 */
export type UserRole = "admin" | "doorman" | "resident";

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  profileId: string;
  role: UserRole;
  apartment?: string;
  block?: string;
}
