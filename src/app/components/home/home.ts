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
  loading: boolean = false;

  private authService = inject(AuthService);
  private contactService = inject(ContactService);
  private router = inject(Router);

  ngOnInit() {
    this.loadUserName();
    this.loadContactsCount();
  }

  loadUserName() {
    const user = this.authService.currentUser;
    if (user && user.email) {
      const emailUsername = user.email.split('@')[0];
      const nameParts = emailUsername.split('.');
      this.userName = this.capitalize(nameParts[0] || 'Usuario');
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
    }
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}