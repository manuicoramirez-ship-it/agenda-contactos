import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

export type UserRole = 'admin' | 'user' | 'visitor';

export interface RolePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  canManageUsers: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
  private currentUserRole: UserRole = 'user';

  // Definición de permisos por rol
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

  async getUserRole(uid: string): Promise<UserRole> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.currentUserRole = data['role'] || 'user';
        return this.currentUserRole;
      }
      return 'user';
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      return 'user';
    }
  }

  async setUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      await setDoc(doc(this.firestore, 'users', uid), { role }, { merge: true });
      console.log(`✅ Rol actualizado a: ${role}`);
    } catch (error) {
      console.error('Error actualizando rol:', error);
      throw error;
    }
  }

  getPermissions(role?: UserRole): RolePermissions {
    const userRole = role || this.currentUserRole;
    return this.ROLE_PERMISSIONS[userRole];
  }

  hasPermission(permission: keyof RolePermissions): boolean {
    return this.getPermissions()[permission];
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