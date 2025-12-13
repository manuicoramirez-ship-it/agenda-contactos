export interface Contact {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactType: string;
  userId: string;
  createdAt: Date;
  photoURL?: string; // ← NUEVO
  updatedAt?: Date;  // ← NUEVO
}