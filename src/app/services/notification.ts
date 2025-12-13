import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // Milisegundos
  closable?: boolean; // Si se puede cerrar manualmente
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private defaultDuration = 5000; // 5 segundos
  private maxNotifications = 5; // Máximo de notificaciones simultáneas

  constructor() {
    console.log('🔔 Servicio de notificaciones inicializado');
  }

  /**
   * Mostrar notificación de éxito
   */
  success(message: string, duration?: number): void {
    this.show({
      type: 'success',
      message,
      duration: duration || this.defaultDuration,
      closable: true
    });
  }

  /**
   * Mostrar notificación de error
   */
  error(message: string, duration?: number): void {
    this.show({
      type: 'error',
      message,
      duration: duration || this.defaultDuration,
      closable: true
    });
    this.playSound('error');
  }

  /**
   * Mostrar notificación de advertencia
   */
  warning(message: string, duration?: number): void {
    this.show({
      type: 'warning',
      message,
      duration: duration || this.defaultDuration,
      closable: true
    });
  }

  /**
   * Mostrar notificación informativa
   */
  info(message: string, duration?: number): void {
    this.show({
      type: 'info',
      message,
      duration: duration || this.defaultDuration,
      closable: true
    });
  }

  /**
   * Mostrar notificación personalizada
   */
  show(options: Partial<Notification>): void {
    const notification: Notification = {
      id: this.generateId(),
      type: options.type || 'info',
      message: options.message || '',
      duration: options.duration || this.defaultDuration,
      closable: options.closable !== undefined ? options.closable : true,
      timestamp: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;

    // Limitar número de notificaciones
    if (currentNotifications.length >= this.maxNotifications) {
      currentNotifications.shift(); // Eliminar la más antigua
    }

    // Añadir nueva notificación
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-eliminar después del tiempo especificado
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }

    console.log(`🔔 [${notification.type.toUpperCase()}] ${notification.message}`);
  }

  /**
   * Eliminar notificación por ID
   */
  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filtered = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filtered);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clear(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Obtener todas las notificaciones actuales
   */
  getAll(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Generar ID único
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reproducir sonido de notificación (opcional)
   */
  private playSound(type: 'success' | 'error' | 'warning' | 'info'): void {
    // Frecuencias para diferentes tipos de sonidos
    const frequencies: Record<string, number[]> = {
      success: [523.25, 659.25], // Do - Mi
      error: [392, 349.23],       // Sol - Fa
      warning: [440, 493.88],     // La - Si
      info: [523.25]              // Do
    };

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequencies[type][0];
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

      // Segundo tono si existe
      if (frequencies[type][1]) {
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          
          osc2.frequency.value = frequencies[type][1];
          osc2.type = 'sine';
          
          gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.1);
        }, 100);
      }
    } catch (error) {
      console.warn('No se pudo reproducir sonido:', error);
    }
  }

  /**
   * Configurar duración por defecto
   */
  setDefaultDuration(duration: number): void {
    this.defaultDuration = duration;
  }

  /**
   * Configurar máximo de notificaciones
   */
  setMaxNotifications(max: number): void {
    this.maxNotifications = max;
  }
}