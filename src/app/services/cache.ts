import { Injectable } from '@angular/core';
import { Contact } from '../models/contact';

interface CacheData {
  contacts: Contact[];
  timestamp: number;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private contactsCache: CacheData | null = null;
  private readonly CACHE_DURATION = 30000; // 30 segundos en milisegundos

  constructor() {
    console.log('💾 Servicio de caché inicializado');
  }

  /**
   * Guardar contactos en caché
   * @param contacts - Array de contactos
   * @param userId - ID del usuario actual
   */
  setContacts(contacts: Contact[], userId: string): void {
    this.contactsCache = {
      contacts: [...contacts], // Clonar array para evitar mutaciones
      timestamp: Date.now(),
      userId: userId
    };
    console.log(`💾 Caché actualizado: ${contacts.length} contactos guardados`);
  }

  /**
   * Obtener contactos desde caché
   * @param userId - ID del usuario actual
   * @returns Array de contactos o null si no hay caché válido
   */
  getContacts(userId: string): Contact[] | null {
    // Verificar si existe caché
    if (!this.contactsCache) {
      console.log('⚠️ No hay caché disponible');
      return null;
    }

    // Verificar si el userId coincide
    if (this.contactsCache.userId !== userId) {
      console.log('⚠️ Caché de otro usuario, invalidando...');
      this.contactsCache = null;
      return null;
    }

    // Verificar si el caché expiró
    const now = Date.now();
    const cacheAge = now - this.contactsCache.timestamp;
    const isExpired = cacheAge > this.CACHE_DURATION;

    if (isExpired) {
      console.log(`⏰ Caché expirado (${(cacheAge / 1000).toFixed(1)}s), invalidando...`);
      this.contactsCache = null;
      return null;
    }

    // Caché válido
    const remainingTime = ((this.CACHE_DURATION - cacheAge) / 1000).toFixed(1);
    console.log(`⚡ Usando caché (expira en ${remainingTime}s)`);
    return [...this.contactsCache.contacts]; // Retornar copia
  }

  /**
   * Invalidar (limpiar) el caché
   * Se usa cuando se crea, edita o elimina un contacto
   */
  invalidateCache(): void {
    if (this.contactsCache) {
      console.log('🗑️ Caché invalidado manualmente');
    }
    this.contactsCache = null;
  }

  /**
   * Verificar si hay caché válido
   * @param userId - ID del usuario actual
   * @returns true si hay caché válido
   */
  hasCachedContacts(userId: string): boolean {
    return this.getContacts(userId) !== null;
  }

  /**
   * Obtener información del caché actual
   * Útil para debugging
   */
  getCacheInfo(): { 
    hasCache: boolean; 
    contactsCount: number; 
    age: number; 
    expiresIn: number;
    userId: string | null;
  } {
    if (!this.contactsCache) {
      return {
        hasCache: false,
        contactsCount: 0,
        age: 0,
        expiresIn: 0,
        userId: null
      };
    }

    const now = Date.now();
    const age = now - this.contactsCache.timestamp;
    const expiresIn = Math.max(0, this.CACHE_DURATION - age);

    return {
      hasCache: true,
      contactsCount: this.contactsCache.contacts.length,
      age: Math.floor(age / 1000), // en segundos
      expiresIn: Math.floor(expiresIn / 1000), // en segundos
      userId: this.contactsCache.userId
    };
  }

  /**
   * Configurar duración del caché (en milisegundos)
   * Por defecto: 30000ms (30 segundos)
   */
  private cacheDuration = this.CACHE_DURATION;

  setCacheDuration(duration: number): void {
    if (duration < 0) {
      console.error('⚠️ La duración del caché debe ser positiva');
      return;
    }
    this.cacheDuration = duration;
    console.log(`⚙️ Duración del caché configurada: ${duration / 1000}s`);
  }

  /**
   * Limpiar toda la información del caché
   * Útil al cerrar sesión
   */
  clearAll(): void {
    this.contactsCache = null;
    console.log('🧹 Caché completamente limpiado');
  }
}