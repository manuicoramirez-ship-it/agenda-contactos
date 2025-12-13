import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification';
import { fadeInOut, slideInRight } from '../../animations/animations';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-container.html',
  styleUrls: ['./notification-container.css'],
  animations: [fadeInOut, slideInRight]
})
export class NotificationContainer implements OnInit {
  notifications: Notification[] = [];
  private notificationService = inject(NotificationService);

  ngOnInit() {
    // Suscribirse a las notificaciones
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  closeNotification(id: string) {
    this.notificationService.remove(id);
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }
}