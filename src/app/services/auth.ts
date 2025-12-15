import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword,signOut, user } from '@angular/fire/auth';
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
    this.user$.subscribe(async (u) => {
      this.currentUser = u;

      if (!u) {
        this.currentUserRole = 'visitor';
        this.roleService.setCurrentRole('visitor');
        return;
      }

      const role = await this.ensureAndLoadRole(u.uid, u.email ?? '');
      this.currentUserRole = role;
      this.roleService.setCurrentRole(role);

      console.log('👤 Usuario:', u.email, '| Rol:', role);
    });
  }

  private async ensureAndLoadRole(uid: string, email: string): Promise<UserRole> {
    try {
      const ref = doc(this.firestore, 'users', uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        const userDoc = {
          uid,
          email,
          role: 'user' as UserRole,
          createdAt: new Date(),
          lastLogin: new Date(),
          firstName: email.split('@')[0].split('.')[0] || 'Usuario',
          lastName: email.split('@')[0].split('.')[1] || 'Sin apellido'
        };
        await setDoc(ref, userDoc, { merge: true });
        console.warn('⚠️ Usuario sin documento previo, creado con datos de email');
        return 'user';
      }

      return await this.roleService.getUserRole(uid);
    } catch (e) {
      console.error('❌ Error cargando/asegurando rol:', e);
      return 'visitor';
    }
  }

  // REGISTRO
  async register(email: string, password: string, firstName: string, lastName: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('📝 Registrando usuario...');
        console.log('Datos recibidos:', { email, firstName, lastName });
        
        // 1. Crear usuario en Firebase Auth
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
        // 2. Guardar datos adicionales en Firestore
        const userDoc = {
          uid: credential.user.uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'user' as UserRole,
          createdAt: new Date(),
          lastLogin: new Date()
        };
      
        console.log('💾 Guardando en Firestore:', userDoc);
        await setDoc(doc(this.firestore, 'users', credential.user.uid), userDoc);
        console.log('✅ Usuario registrado correctamente con nombre:', firstName, lastName);
      
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

        await setDoc(
          doc(this.firestore, 'users', result.user.uid),
          { lastLogin: new Date() },
          { merge: true }
        );

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
        console.log('📂 Obteniendo datos del usuario:', uid);
        const userDoc = await getDoc(doc(this.firestore, 'users', uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('✅ Datos obtenidos:', data);
          return data;
        } else {
          console.warn('⚠️ Usuario no encontrado en Firestore');
          return null;
        }
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