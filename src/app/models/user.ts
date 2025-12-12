export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'visitor'; // NUEVO
  photoURL?: string; // NUEVO para imágenes
  createdAt: Date;
  lastLogin?: Date; // NUEVO
}