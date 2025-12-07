import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  userData: any = null;
  loading: boolean = false;

  private authService = inject(AuthService);

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const user = this.authService.currentUser;
    if (user && user.email) {
      // Extraer nombre del email
      const emailUsername = user.email.split('@')[0];
      const nameParts = emailUsername.split('.');
      
      this.userData = {
        email: user.email,
        uid: user.uid,
        firstName: this.capitalize(nameParts[0] || 'Usuario'),
        lastName: this.capitalize(nameParts[1] || ''),
        createdAt: { 
          toDate: () => {
            if (user.metadata && user.metadata.creationTime) {
              return new Date(user.metadata.creationTime);
            }
            return new Date();
          }
        }
      };
    }
  }

  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}