/*import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, Timestamp } from '@angular/fire/firestore';
import { Contact } from '../models/contact';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);

  async addContact(contact: Omit<Contact, 'id'>) {
    try {
      const contactData = {
        ...contact,
        userId: this.authService.currentUser?.uid,
        createdAt: Timestamp.now()
      };
      return await addDoc(collection(this.firestore, 'contacts'), contactData);
    } catch (error) {
      throw error;
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      const q = query(
        collection(this.firestore, 'contacts'),
        where('userId', '==', this.authService.currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Contact));
    } catch (error) {
      throw error;
    }
  }

  async updateContact(id: string, contact: Partial<Contact>) {
    try {
      const contactRef = doc(this.firestore, 'contacts', id);
      return await updateDoc(contactRef, { ...contact });
    } catch (error) {
      throw error;
    }
  }

  async deleteContact(id: string) {
    try {
      return await deleteDoc(doc(this.firestore, 'contacts', id));
    } catch (error) {
      throw error;
    }
  }
}*/
import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, Timestamp } from '@angular/fire/firestore';
import { Contact } from '../models/contact';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);
  private injector = inject(Injector);

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
        return docRef;
      } catch (error) {
        console.error('❌ Error al agregar contacto:', error);
        throw error;
      }
    });
  }

  async getContacts(): Promise<Contact[]> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const userId = this.authService.currentUser?.uid;
        
        if (!userId) {
          console.warn('⚠️ No hay usuario autenticado');
          return [];
        }

        console.log('📋 Obteniendo contactos del usuario:', userId);

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

        console.log(`✅ ${contacts.length} contactos cargados`);
        return contacts;

      } catch (error: any) {
        console.error('❌ Error al obtener contactos:', error);
        
        if (error.message && error.message.includes('index')) {
          console.error('🔧 Necesitas crear un índice en Firestore.');
          console.error('Ve a Firebase Console → Firestore → Indexes');
        }
        
        return [];
      }
    });
  }

  async updateContact(id: string, contact: Partial<Contact>) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('✏️ Actualizando contacto:', id);
        const contactRef = doc(this.firestore, 'contacts', id);
        await updateDoc(contactRef, { ...contact });
        console.log('✅ Contacto actualizado');
      } catch (error) {
        console.error('❌ Error al actualizar contacto:', error);
        throw error;
      }
    });
  }

  async deleteContact(id: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        console.log('🗑️ Eliminando contacto:', id);
        await deleteDoc(doc(this.firestore, 'contacts', id));
        console.log('✅ Contacto eliminado');
      } catch (error) {
        console.error('❌ Error al eliminar contacto:', error);
        throw error;
      }
    });
  }
}