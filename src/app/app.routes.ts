import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Home } from './components/home/home';
import { Contacts } from './components/contacts/contacts';
import { Statistics } from './components/statistics/statistics';
import { Profile } from './components/profile/profile';
import { authGuard } from './guards/auth-guard'; 

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { 
    path: 'home', 
    component: Home,
    canActivate: [authGuard] 
  },
  { 
    path: 'contacts', 
    component: Contacts,
    canActivate: [authGuard] 
  },
  { 
    path: 'statistics', 
    component: Statistics,
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    component: Profile,
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: '/login' }
];