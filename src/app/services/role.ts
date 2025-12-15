import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

export type UserRole = 'admin' | 'user' | 'visitor';

export interface RolePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  canManageUsers: boolean;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private firestore = inject(Firestore);

  private currentUserRole: UserRole = 'visitor';

  // Permisos por rol
  private readonly ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    admin: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canViewAll: true,
      canManageUsers: true
    },
    user: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canViewAll: false,
      canManageUsers: false
    },
    visitor: {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canViewAll: false,
      canManageUsers: false
    }
  };

  /* Rol actual cargado en memoria */
  getCurrentRole(): UserRole {
    return this.currentUserRole;
  }

  /* Setear rol en memoria (por ejemplo al cerrar sesión) */
  setCurrentRole(role: UserRole): void {
    this.currentUserRole = role;
  }

  /* Lee rol desde Firestore y lo guarda en memoria */
  async getUserRole(uid: string): Promise<UserRole> {
    try {
      const ref = doc(this.firestore, 'users', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const role = (data?.['role'] ?? 'user') as UserRole;

        this.currentUserRole = role;
        return role;
      }

      // Si no existe documento, por seguridad lo tratamos como visitante
      this.currentUserRole = 'visitor';
      return 'visitor';
    } catch (error) {
      console.error('❌ Error obteniendo rol:', error);
      this.currentUserRole = 'visitor';
      return 'visitor';
    }
  }

  /* Guarda rol en Firestore y lo actualiza en memoria */
  async setUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      await setDoc(doc(this.firestore, 'users', uid), { role }, { merge: true });
      this.currentUserRole = role;
      console.log(`✅ Rol actualizado a: ${role}`);
    } catch (error) {
      console.error('❌ Error actualizando rol:', error);
      throw error;
    }
  }

  getPermissions(role?: UserRole): RolePermissions {
    const userRole = role ?? this.currentUserRole;
    return this.ROLE_PERMISSIONS[userRole];
  }

  // Verificar permisos
  hasPermission(permission: keyof RolePermissions, role?: UserRole): boolean {
    return this.getPermissions(role)[permission];
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'admin';
  }

  isUser(): boolean {
    return this.currentUserRole === 'user';
  }

  isVisitor(): boolean {
    return this.currentUserRole === 'visitor';
  }

  getRoleName(role: UserRole): string {
    const names: Record<UserRole, string> = {
      admin: 'Administrador',
      user: 'Usuario',
      visitor: 'Visitante'
    };
    return names[role];
  }

  getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      admin: '#f44336',
      user: '#4caf50',
      visitor: '#ff9800'
    };
    return colors[role];
  }

  getRoleIcon(role: UserRole): string {
    const icons: Record<UserRole, string> = {
      admin: '👑',
      user: '👤',
      visitor: '👁️'
    };
    return icons[role];
  }
}
