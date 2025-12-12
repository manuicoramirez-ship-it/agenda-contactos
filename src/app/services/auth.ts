import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { RoleService, UserRole } from './role';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);
  private roleService = inject(RoleService);
    
  user$ = user(this.auth);
  currentUser: any = null;
  currentUserRole: UserRole = 'user'; // NUEVO

  constructor() {
    this.user$.subscribe(async user => {
      this.currentUser = user;
      if (user) {
        // NUEVO: Cargar rol al autenticarse
        this.currentUserRole = await this.roleService.getUserRole(user.uid);
        console.log('👤 Usuario:', user.email, '| Rol:', this.currentUserRole);
      }
    });
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('📝 Registrando usuario...');
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
        
        // MODIFICADO: Guardar usuario con rol por defecto
        const userDoc = {
          uid: credential.user.uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'user' as UserRole, // NUEVO: Rol por defecto
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        await setDoc(doc(this.firestore, 'users', credential.user.uid), userDoc);
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
        
        // NUEVO: Actualizar última conexión
        await setDoc(
          doc(this.firestore, 'users', result.user.uid),
          { lastLogin: new Date() },
          { merge: true }
        );
        
        // NUEVO: Cargar rol
        this.currentUserRole = await this.roleService.getUserRole(result.user.uid);
        
        console.log('✅ Login exitoso:', result.user.email, '| Rol:', this.currentUserRole);
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
        this.currentUserRole = 'user';
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
        if (userDoc.exists()) {
          return userDoc.data();
        }
        return null;
      } catch (error) {
        console.error('❌ Error al obtener datos:', error);
        throw error;
      }
    });
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // NUEVO: Verificar si es admin
  isAdmin(): boolean {
    return this.currentUserRole === 'admin';
  }

  // NUEVO: Obtener rol actual
  getCurrentRole(): UserRole {
    return this.currentUserRole;
  }
}