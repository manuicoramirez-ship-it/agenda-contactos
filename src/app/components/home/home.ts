/*import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ContactService } from '../../services/contact';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  userName: string = '';
  totalContacts: number = 0;
  loading: boolean = true;

  private authService = inject(AuthService);
  private contactService = inject(ContactService);
  private router = inject(Router);

  async ngOnInit() {
    await this.loadUserData();
    await this.loadContactsCount();
  }

  async loadUserData() {
    const user = this.authService.currentUser;
    if (user) {
      const userData = await this.authService.getUserData(user.uid);
      this.userName = userData?.['firstName'] || 'Usuario';
    }
  }

  async loadContactsCount() {
    try {
      const contacts = await this.contactService.getContacts();
      this.totalContacts = contacts.length;
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}*/
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ContactService } from '../../services/contact';
import { doc, getDoc, getFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  userName: string = '';
  totalContacts: number = 0;
  loading: boolean = true;

  private authService = inject(AuthService);
  private contactService = inject(ContactService);
  private router = inject(Router);

  async ngOnInit() {
    try {
      await this.loadUserData();
      await this.loadContactsCount();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.userName = 'Usuario';
      this.totalContacts = 0;
    } finally {
      this.loading = false; // ← IMPORTANTE: Siempre termina de cargar
    }
  }

  async loadUserData() {
    try {
      const user = this.authService.currentUser;
      if (user) {
        const userData = await this.authService.getUserData(user.uid);
        this.userName = userData?.['firstName'] || 'Usuario';
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      this.userName = 'Usuario';
    }
  }

  async loadContactsCount() {
    try {
      const contacts = await this.contactService.getContacts();
      this.totalContacts = contacts.length;
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      this.totalContacts = 0; // ← Si hay error, muestra 0
    }
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}