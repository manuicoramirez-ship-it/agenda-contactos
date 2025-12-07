import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ContactService } from '../../services/contact';
import { Contact } from '../../models/contact';
import { PhoneFormatPipe } from '../../pipes/phone-format-pipe';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PhoneFormatPipe],
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.css']
})
export class Contacts implements OnInit {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  contactForm: FormGroup;
  showForm: boolean = false;
  editingId: string | null = null;
  searchTerm: string = '';
  loading: boolean = false;

  contactTypes = ['Familia', 'Amigo', 'Trabajo', 'Otro'];

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private contactService = inject(ContactService);

  constructor() {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      contactType: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadContacts();
  }

  async loadContacts() {
    this.loading = true;
    try {
      this.contacts = await this.contactService.getContacts();
      this.filteredContacts = [...this.contacts];
    } catch (error) {
      console.error(error);
      alert('Error al cargar contactos');
    } finally {
      this.loading = false;
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.contactForm.reset();
      this.editingId = null;
    }
  }

  editContact(contact: Contact) {
    this.editingId = contact.id || null;
    this.contactForm.patchValue({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      contactType: contact.contactType
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isDuplicateContact(email: string, phone: string): boolean {
    return this.contacts.some(contact => {
      if (this.editingId && contact.id === this.editingId) {
        return false; // Ignorar el contacto que estamos editando
      }
      return contact.email.toLowerCase() === email.toLowerCase() || 
             contact.phone === phone;
    });
  }

  ///////////////

  filterContacts(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.filteredContacts = this.contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(this.searchTerm) ||
    contact.lastName.toLowerCase().includes(this.searchTerm) ||
    contact.email.toLowerCase().includes(this.searchTerm) ||
    contact.phone.includes(this.searchTerm) ||
    contact.contactType.toLowerCase().includes(this.searchTerm)
    );
  }
    logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
    this.authService.logout();
    }
    }
}