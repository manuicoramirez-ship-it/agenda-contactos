import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);
  
  user$ = user(this.auth);
  currentUser: any = null;

  constructor() {
    this.user$.subscribe(user => {
      this.currentUser = user;
      console.log('Usuario actual:', user?.email || 'No autenticado');
    });
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('📝 Intentando registrar usuario...');
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
        /*
        const userDoc = {
          uid: credential.user.uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          createdAt: new Date()
        };
        
        console.log('💾 Guardando datos en Firestore...');
        await setDoc(doc(this.firestore, 'users', credential.user.uid), userDoc);
        */
        console.log('✅ Usuario registrado exitosamente');
        
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
        console.log('🔐 Intentando iniciar sesión...');
        const result = await signInWithEmailAndPassword(this.auth, email, password);
        console.log('✅ Login exitoso:', result.user.email);
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
        this.router.navigate(['/login']);
        console.log('✅ Sesión cerrada');
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        throw error;
      }
    });
  }

  /*async getUserData(uid: string) {
    // DESHABILITADO: getDoc() no funciona en esta configuración
    console.warn('getUserData() está deshabilitado. Usando datos de Authentication.');
    return null;
  }*/

  async getUserData(uid: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('📂 Obteniendo datos del usuario...');
        const userDoc = await getDoc(doc(this.firestore, 'users', uid));
        
        if (userDoc.exists()) {
          console.log('✅ Datos obtenidos');
          return userDoc.data();
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
}