import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, Timestamp } from '@angular/fire/firestore';
import { Contact } from '../models/contact';
import { AuthService } from './auth';
import { CacheService } from './cache'; // ← NUEVO IMPORT

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);
  private cacheService = inject(CacheService); // ← NUEVO: Inyectar servicio de caché
  private injector = inject(Injector);
  
  // Variable para evitar múltiples llamadas simultáneas
  private loadingContacts: Promise<Contact[]> | null = null;

  // ========================================
  // AGREGAR CONTACTO
  // ========================================
  async addContact(contact: Omit<Contact, 'id'>) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('➕ Agregando contacto...');
        const contactData = {
          ...contact,
          userId: this.authService.currentUser?.uid,
          createdAt: Timestamp.now()
        };
        const docRef = await addDoc(collection(this.firestore, 'contacts'), contactData);
        console.log('✅ Contacto agregado:', docRef.id);
        
        // ← NUEVO: Invalidar caché al agregar
        this.cacheService.invalidateCache();
        
        return docRef;
      } catch (error) {
        console.error('❌ Error al agregar contacto:', error);
        throw error;
      }
    });
  }

  // ========================================
  // OBTENER CONTACTOS (CON CACHÉ)
  // ========================================
  async getContacts(): Promise<Contact[]> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const userId = this.authService.currentUser?.uid;
        
        if (!userId) {
          console.warn('⚠️ No hay usuario autenticado');
          return [];
        }

        // ← NUEVO: 1. INTENTAR OBTENER DESDE CACHÉ
        const cachedContacts = this.cacheService.getContacts(userId);
        if (cachedContacts) {
          console.log('⚡ Contactos cargados desde caché (instantáneo)');
          return cachedContacts;
        }

        // ← NUEVO: 2. Evitar múltiples llamadas simultáneas
        if (this.loadingContacts) {
          console.log('⏳ Esperando carga en progreso...');
          return this.loadingContacts;
        }

        console.log('📋 Obteniendo contactos del usuario:', userId);

        // 3. SI NO HAY CACHÉ, CARGAR DESDE FIRESTORE
        this.loadingContacts = this.fetchContactsFromFirestore(userId);
        const contacts = await this.loadingContacts;
        this.loadingContacts = null;

        // ← NUEVO: 4. GUARDAR EN CACHÉ PARA PRÓXIMAS VECES
        this.cacheService.setContacts(contacts, userId);

        return contacts;
      } catch (error: any) {
        this.loadingContacts = null;
        console.error('❌ Error al obtener contactos:', error);
        
        if (error.message && error.message.includes('index')) {
          console.error('🔧 Necesitas crear un índice en Firestore.');
          console.error('Ve a Firebase Console → Firestore → Indexes');
        }
        
        return [];
      }
    });
  }

  // ========================================
  // MÉTODO PRIVADO: FETCH DESDE FIRESTORE
  // ========================================
  private async fetchContactsFromFirestore(userId: string): Promise<Contact[]> {
    const q = query(
      collection(this.firestore, 'contacts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('📭 No hay contactos');
      return [];
    }

    const contacts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Contact));

    console.log(`✅ ${contacts.length} contactos cargados desde Firestore`);
    return contacts;
  }

  // ========================================
  // ACTUALIZAR CONTACTO
  // ========================================
  async updateContact(id: string, contact: Partial<Contact>) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('✏️ Actualizando contacto:', id);
        const contactRef = doc(this.firestore, 'contacts', id);
        await updateDoc(contactRef, { ...contact });
        console.log('✅ Contacto actualizado');
        
        // ← NUEVO: Invalidar caché al actualizar
        this.cacheService.invalidateCache();
      } catch (error) {
        console.error('❌ Error al actualizar contacto:', error);
        throw error;
      }
    });
  }

  // ========================================
  // ELIMINAR CONTACTO
  // ========================================
  async deleteContact(id: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('🗑️ Eliminando contacto:', id);
        await deleteDoc(doc(this.firestore, 'contacts', id));
        console.log('✅ Contacto eliminado');
        
        // ← NUEVO: Invalidar caché al eliminar
        this.cacheService.invalidateCache();
      } catch (error) {
        console.error('❌ Error al eliminar contacto:', error);
        throw error;
      }
    });
  }
}