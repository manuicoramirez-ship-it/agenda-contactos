import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ContactService } from '../../services/contact';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  firstName: string = '';
  lastName: string = '';
  userName: string = '';
  userEmail: string = '';
  userId: string = '';
  userInitials: string = '';

  createdAtDate: string = '';
  createdAtTime: string = '';


  totalContacts: number = 0;
  loading: boolean = true;

  private authService = inject(AuthService);
  private contactService = inject(ContactService);
  private router = inject(Router);

  ngOnInit() {
    this.loadUserData();
    this.loadContactsCount();
  }

  loadUserData() {
    const user = this.authService.currentUser;
    if (user) {
      this.userEmail = user.email || '';
      this.userId = user.uid || '';

      // Obtener nombre y apellido del email
      const emailUsername = this.userEmail.split('@')[0];
      const nameParts = emailUsername.split('.');

      // Guardar nombre y apellido por separado
      this.firstName = this.capitalize(nameParts[0] || 'Usuario');
      this.lastName = this.capitalize(nameParts[1] || 'Sin Apellido');
      
      this.userName = `${this.firstName} ${this.lastName}`;
      this.userInitials = this.firstName.charAt(0) + this.lastName.charAt(0);

      // Fecha y hora en formato dd/mm/yy y hh:mm:ss
      if (user.metadata && user.metadata.creationTime) {
        const creationDate = new Date(user.metadata.creationTime);
        
        // Formato: dd/mm/yy
        const day = String(creationDate.getDate()).padStart(2, '0');
        const month = String(creationDate.getMonth() + 1).padStart(2, '0');
        const year = String(creationDate.getFullYear()).slice(-2); // Solo últimos 2 dígitos
        this.createdAtDate = `${day}/${month}/${year}`;
        
        // Formato: hh:mm:ss
        const hours = String(creationDate.getHours()).padStart(2, '0');
        const minutes = String(creationDate.getMinutes()).padStart(2, '0');
        const seconds = String(creationDate.getSeconds()).padStart(2, '0');
        this.createdAtTime = `${hours}:${minutes}:${seconds}`;
      } else {
        this.createdAtDate = 'No disponible';
        this.createdAtTime = 'No disponible';
      }
    }
    this.loading = false;
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
    }
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}