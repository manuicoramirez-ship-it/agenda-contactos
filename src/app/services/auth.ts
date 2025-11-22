import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router = inject(Router);
  
  user$ = user(this.auth);
  currentUser: User | null = null;

  constructor() {
    this.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userDoc = {
        uid: credential.user.uid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        createdAt: new Date()
      };
      await setDoc(doc(this.firestore, 'users', credential.user.uid), userDoc);
      return credential;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      throw error;
    }
  }

  async getUserData(uid: string) {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    return userDoc.data();
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}