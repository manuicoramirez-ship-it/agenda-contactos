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
  // Estado de la aplicación
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  contactForm: FormGroup;
  
  // Flags de control
  showForm: boolean = false;
  editingId: string | null = null;
  loading: boolean = true;
  submitting: boolean = false;
  
  // Sistema de notificaciones
  notification: { type: 'success' | 'error' | 'warning', message: string } | null = null;
  
  // Búsqueda
  searchTerm: string = '';
  
  // Tipos de contacto
  readonly contactTypes = ['Familia', 'Amigo', 'Trabajo', 'Otro'];

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private contactService = inject(ContactService);

  constructor() {
    this.contactForm = this.createContactForm();
  }

  async ngOnInit() {
    await this.loadContacts();
  }

  // NUEVO: Método para crear el formulario (más limpio)
  private createContactForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      contactType: ['', Validators.required]
    });
  }

  // MEJORADO: Carga de contactos con mejor manejo de errores
  async loadContacts(): Promise<void> {
    this.loading = true;
    this.clearNotification();
    
    try {
      this.contacts = await this.contactService.getContacts();
      this.filteredContacts = [...this.contacts];
      
      if (this.contacts.length === 0) {
        this.showNotification('warning', '📭 No tienes contactos aún. ¡Agrega tu primer contacto!');
      }
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      this.showNotification('error', '❌ Error al cargar contactos. Por favor, recarga la página.');
    } finally {
      this.loading = false;
    }
  }

  // NUEVO: Recarga sin mostrar loading
  private async reloadContacts(): Promise<void> {
    try {
      this.contacts = await this.contactService.getContacts();
      this.applySearchFilter();
    } catch (error) {
      console.error('Error al recargar:', error);
    }
  }

  // MEJORADO: Toggle del formulario con limpieza de estado
  toggleForm(): void {
    this.showForm = !this.showForm;
    
    if (!this.showForm) {
      this.resetFormState();
    } else {
      this.clearNotification();
      this.scrollToTop();
    }
  }

  // NUEVO: Resetear estado del formulario
  private resetFormState(): void {
    this.contactForm.reset();
    this.editingId = null;
    this.clearNotification();
  }

  // MEJORADO: Edición de contacto
  editContact(contact: Contact): void {
    this.editingId = contact.id || null;
    this.contactForm.patchValue({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      contactType: contact.contactType
    });
    this.showForm = true;
    this.clearNotification();
    this.scrollToTop();
  }

  // NUEVO: Validación completa de duplicados
  private validateDuplicates(email: string, phone: string): { isDuplicate: boolean, message: string } {
    const emailDuplicate = this.findDuplicateByEmail(email);
    const phoneDuplicate = this.findDuplicateByPhone(phone);

    if (emailDuplicate && phoneDuplicate && emailDuplicate.id === phoneDuplicate.id) {
      return {
        isDuplicate: true,
        message: `⚠️ Este contacto ya existe:\n👤 ${emailDuplicate.firstName} ${emailDuplicate.lastName}\n📧 ${emailDuplicate.email}\n📱 ${emailDuplicate.phone}`
      };
    }

    if (emailDuplicate) {
      return {
        isDuplicate: true,
        message: `⚠️ Ya existe un contacto con este correo:\n👤 ${emailDuplicate.firstName} ${emailDuplicate.lastName}\n📧 ${emailDuplicate.email}`
      };
    }

    if (phoneDuplicate) {
      return {
        isDuplicate: true,
        message: `⚠️ Ya existe un contacto con este teléfono:\n👤 ${phoneDuplicate.firstName} ${phoneDuplicate.lastName}\n📱 ${phoneDuplicate.phone}`
      };
    }

    return { isDuplicate: false, message: '' };
  }

  // NUEVO: Buscar duplicado por email
  private findDuplicateByEmail(email: string): Contact | undefined {
    return this.contacts.find(contact => {
      if (this.editingId && contact.id === this.editingId) return false;
      return contact.email.toLowerCase() === email.toLowerCase();
    });
  }

  // NUEVO: Buscar duplicado por teléfono
  private findDuplicateByPhone(phone: string): Contact | undefined {
    return this.contacts.find(contact => {
      if (this.editingId && contact.id === this.editingId) return false;
      return contact.phone === phone;
    });
  }

  // MEJORADO: Envío del formulario con validaciones
  async onSubmit(): Promise<void> {
    if (!this.contactForm.valid) {
      this.showNotification('warning', '⚠️ Por favor completa todos los campos correctamente');
      return;
    }

    const formData = this.contactForm.value;

    // Validar duplicados solo al crear
    if (!this.editingId) {
      const validation = this.validateDuplicates(formData.email, formData.phone);
      if (validation.isDuplicate) {
        this.showNotification('warning', validation.message);
        return;
      }
    }

    await this.saveContact(formData);
  }

  // NUEVO: Método para guardar contacto
  private async saveContact(formData: any): Promise<void> {
    this.submitting = true;
    this.clearNotification();

    try {
      const contactData = {
        ...formData,
        userId: this.authService.currentUser?.uid
      };

      if (this.editingId) {
        await this.contactService.updateContact(this.editingId, contactData);
        this.showNotification('success', `✅ Contacto "${formData.firstName} ${formData.lastName}" actualizado exitosamente`);
      } else {
        await this.contactService.addContact(contactData);
        this.showNotification('success', `✅ Contacto "${formData.firstName} ${formData.lastName}" agregado exitosamente`);
      }

      this.toggleForm();
      await this.reloadContacts();
    } catch (error) {
      console.error('Error al guardar:', error);
      this.showNotification('error', '❌ Error al guardar el contacto. Por favor, intenta nuevamente.');
    } finally {
      this.submitting = false;
    }
  }

  // MEJORADO: Eliminar contacto con confirmación
  async deleteContact(contact: Contact): Promise<void> {
    const confirmed = confirm(
      `¿Estás seguro de eliminar este contacto?\n\n` +
      `👤 ${contact.firstName} ${contact.lastName}\n` +
      `📧 ${contact.email}\n` +
      `📱 ${contact.phone}`
    );

    if (!confirmed || !contact.id) return;

    try {
      await this.contactService.deleteContact(contact.id);
      this.showNotification('success', `✅ Contacto "${contact.firstName} ${contact.lastName}" eliminado exitosamente`);
      await this.reloadContacts();
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.showNotification('error', '❌ Error al eliminar el contacto. Por favor, intenta nuevamente.');
    }
  }

  // MEJORADO: Filtro de búsqueda optimizado
  filterContacts(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase().trim();
    this.applySearchFilter();
  }

  // NUEVO: Aplicar filtro de búsqueda
  private applySearchFilter(): void {
    if (!this.searchTerm) {
      this.filteredContacts = [...this.contacts];
      return;
    }

    this.filteredContacts = this.contacts.filter(contact => 
      this.matchesSearchTerm(contact, this.searchTerm)
    );
  }

  // NUEVO: Verificar si el contacto coincide con el término de búsqueda
  private matchesSearchTerm(contact: Contact, term: string): boolean {
    const searchableFields = [
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.phone,
      contact.contactType,
      `${contact.firstName} ${contact.lastName}` // Nombre completo
    ];

    return searchableFields.some(field => 
      field.toLowerCase().includes(term)
    );
  }

  // NUEVO: Sistema de notificaciones
  private showNotification(type: 'success' | 'error' | 'warning', message: string): void {
    this.notification = { type, message };
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.clearNotification();
    }, 5000);
  }

  // NUEVO: Limpiar notificación
  clearNotification(): void {
    this.notification = null;
  }

  // NUEVO: Scroll al tope
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Helpers para el template
  get isEditing(): boolean {
    return this.editingId !== null;
  }

  get formTitle(): string {
    return this.isEditing ? '✏️ Editar Contacto' : '➕ Nuevo Contacto';
  }

  get submitButtonText(): string {
    if (this.submitting) return '⏳ Guardando...';
    return this.isEditing ? '💾 Actualizar' : '➕ Guardar';
  }

  logout(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}

/*import { Component, inject, OnInit } from '@angular/core';
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

  async onSubmit() {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      
      // ARREGLADO: Validar duplicados
      if (!this.editingId && this.isDuplicateContact(formData.email, formData.phone)) {
        alert('⚠️ Ya existe un contacto con ese correo o teléfono');
        return;
      }

      try {
        const contactData = {
          ...formData,
          userId: this.authService.currentUser?.uid
        };

        if (this.editingId) {
          await this.contactService.updateContact(this.editingId, contactData);
          alert('✅ Contacto actualizado exitosamente');
        } else {
          await this.contactService.addContact(contactData);
          alert('✅ Contacto agregado exitosamente');
        }

        this.toggleForm();
        await this.loadContacts();
      } catch (error) {
        alert('❌ Error al guardar contacto');
        console.error(error);
      }
    }
  }

  async deleteContact(id: string | undefined) {
    if (id && confirm('¿Estás seguro de eliminar este contacto?')) {
      try {
        await this.contactService.deleteContact(id);
        alert('✅ Contacto eliminado exitosamente');
        await this.loadContacts();
      } catch (error) {
        alert('❌ Error al eliminar contacto');
        console.error(error);
      }
    }
  }

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
}*/