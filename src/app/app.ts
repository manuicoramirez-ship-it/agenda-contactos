import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainer } from './components/notification-container/notification-container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationContainer],
  template: `
    <app-notification-container></app-notification-container>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}