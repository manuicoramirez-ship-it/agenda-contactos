import { Injectable, inject } from '@angular/core';
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
}