import { Component, inject, OnInit } from '@angular/core';
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
  userName: string = 'Usuario';
  totalContacts: number = 0;
  loading: boolean = true;

  private authService = inject(AuthService);
  private contactService = inject(ContactService);
  private router = inject(Router);

  async ngOnInit() {
    await this.loadUserName();
    await this.loadContactsCount();
  }

  async loadUserName() {
    try {
      const user = this.authService.currentUser;
      if (user && user.uid) {
        // ✅ OBTENER DATOS DESDE FIRESTORE
        const userData = await this.authService.getUserData(user.uid);
        
        if (userData && userData['firstName']) {
          this.userName = userData['firstName'];
          console.log('✅ Nombre cargado desde Firestore:', this.userName);
        } else {
          // Fallback: usar email si no hay datos
          console.warn('⚠️ No se encontraron datos, usando email');
          const emailUsername = user.email?.split('@')[0] || 'Usuario';
          const nameParts = emailUsername.split('.');
          this.userName = this.capitalize(nameParts[0]);
        }
      }
    } catch (error) {
      console.error('Error al cargar nombre:', error);
      this.userName = 'Usuario';
    }
  }

  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  async loadContactsCount() {
    try {
      const contacts = await this.contactService.getContacts();
      this.totalContacts = contacts.length;
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      this.totalContacts = 0;
    } finally {
      this.loading = false;
    }
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}