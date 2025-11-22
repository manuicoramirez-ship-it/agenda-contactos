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
loading: boolean = true;private authService = inject(AuthService);async ngOnInit() {
await this.loadUserProfile();
}async loadUserProfile() {
try {
const user = this.authService.currentUser;
if (user) {
this.userData = await this.authService.getUserData(user.uid);
this.userData.email = user.email;
this.userData.uid = user.uid;
}
} catch (error) {
console.error(error);
} finally {
this.loading = false;
}
}logout() {
if (confirm('¿Estás seguro de cerrar sesión?')) {
this.authService.logout();
}
}
}