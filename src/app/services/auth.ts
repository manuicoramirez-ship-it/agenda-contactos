import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { RoleService, UserRole } from './role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);
  private roleService = inject(RoleService);

  user$ = user(this.auth);

  currentUser: any = null;
  currentUserRole: UserRole = 'visitor';

  constructor() {
    // Se dispara en cada cambio de sesión (login/logout)
    this.user$.subscribe(async (u) => {
      this.currentUser = u;

      if (!u) {
        // Logout o no autenticado
        this.currentUserRole = 'visitor';
        this.roleService.setCurrentRole('visitor');
        return;
      }

      // Cuando hay usuario autenticado, cargar/asegurar rol
      const role = await this.ensureAndLoadRole(u.uid, u.email ?? '');
      this.currentUserRole = role;
      this.roleService.setCurrentRole(role);

      console.log('👤 Usuario:', u.email, '| Rol:', role);
    });
  }

  // ✅ Crea doc si no existe y carga rol
  private async ensureAndLoadRole(uid: string, email: string): Promise<UserRole> {
    try {
      const ref = doc(this.firestore, 'users', uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // Si no existe el doc, lo creamos con rol por defecto
        const userDoc = {
          uid,
          email,
          role: 'user' as UserRole,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        await setDoc(ref, userDoc, { merge: true });
        return 'user';
      }

      // Si existe, usamos RoleService para leer rol
      return await this.roleService.getUserRole(uid);
    } catch (e) {
      console.error('❌ Error cargando/asegurando rol:', e);
      return 'visitor';
    }
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('📝 Registrando usuario...');
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);

        const userDoc = {
          uid: credential.user.uid,
          email,
          firstName,
          lastName,
          role: 'user' as UserRole,
          createdAt: new Date(),
          lastLogin: new Date()
        };

        await setDoc(doc(this.firestore, 'users', credential.user.uid), userDoc, { merge: true });
        console.log('✅ Usuario registrado con rol: user');

        return credential;
      } catch (error: any) {
        console.error('❌ Error al registrar:', error);
        throw error;
      }
    });
  }

  async login(email: string, password: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('🔐 Iniciando sesión...');
        const result = await signInWithEmailAndPassword(this.auth, email, password);

        // actualizar lastLogin
        await setDoc(
          doc(this.firestore, 'users', result.user.uid),
          { lastLogin: new Date() },
          { merge: true }
        );

        // No es obligatorio cargar rol aquí porque el subscribe lo hará,
        // pero lo ponemos para tenerlo inmediato:
        const role = await this.ensureAndLoadRole(result.user.uid, result.user.email ?? '');
        this.currentUserRole = role;
        this.roleService.setCurrentRole(role);

        console.log('✅ Login exitoso:', result.user.email, '| Rol:', role);
        return result;
      } catch (error: any) {
        console.error('❌ Error al hacer login:', error);
        throw error;
      }
    });
  }

  async logout() {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('🚪 Cerrando sesión...');
        await signOut(this.auth);

        // rol seguro por defecto
        this.currentUserRole = 'visitor';
        this.roleService.setCurrentRole('visitor');

        this.router.navigate(['/login']);
        console.log('✅ Sesión cerrada');
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        throw error;
      }
    });
  }

  async getUserData(uid: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        const userDoc = await getDoc(doc(this.firestore, 'users', uid));
        return userDoc.exists() ? userDoc.data() : null;
      } catch (error) {
        console.error('❌ Error al obtener datos:', error);
        throw error;
      }
    });
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'admin';
  }

  getCurrentRole(): UserRole {
    return this.currentUserRole;
  }
}
