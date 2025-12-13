import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ContactService } from '../../services/contact';
import { NotificationService } from '../../services/notification';
import { RoleService } from '../../services/role';
import { StorageService } from '../../services/storage';
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

  // Para upload de imágenes
  selectedImageFile: File | null = null;  
  imagePreview: string | null = null;
  uploadingImage: boolean = false;

  
  // Búsqueda
  searchTerm: string = '';
  
  // Tipos de contacto
  readonly contactTypes = ['Familia', 'Amigo', 'Trabajo', 'Otro'];

  // Servicios inyectados
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private contactService = inject(ContactService);
  private notificationService = inject(NotificationService);
  private roleService = inject(RoleService);
  private storageService = inject(StorageService);

  constructor() {
    this.contactForm = this.createContactForm();
  }

  async ngOnInit() {
    await this.loadContacts();
  }

  // Crear formulario
  private createContactForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      contactType: ['', Validators.required]
    });
  }

  // Cargar contactos
  async loadContacts(): Promise<void> {
    this.loading = true;
    
    try {
      this.contacts = await this.contactService.getContacts();
      this.filteredContacts = [...this.contacts];
      
      if (this.contacts.length === 0) {
        this.notificationService.info('📭 No tienes contactos aún. ¡Agrega tu primer contacto!');
      }
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      this.notificationService.error('❌ Error al cargar contactos. Por favor, recarga la página.');
    } finally {
      this.loading = false;
    }
  }

  // Recargar sin mostrar loading
  private async reloadContacts(): Promise<void> {
    try {
      this.contacts = await this.contactService.getContacts();
      this.applySearchFilter();
    } catch (error) {
      console.error('Error al recargar:', error);
    }
  }

  // Toggle del formulario
  toggleForm(): void {
    this.showForm = !this.showForm;
    
    if (!this.showForm) {
      this.resetFormState();
    } else {
      this.scrollToTop();
    }
  }

  // Resetear estado del formulario
  private resetFormState(): void {
    this.contactForm.reset();
    this.editingId = null;
    this.removeImage(); // ← AÑADIR esta línea
  }

  // Manejar selección de imagen
  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      this.notificationService.error('❌ Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.error('❌ La imagen no puede superar 5MB');
      return;
    }

    this.selectedImageFile = file;

    // Mostrar preview
    try {
      this.imagePreview = await this.storageService.getImagePreview(file);
      this.notificationService.success('✅ Imagen cargada. Guarda el contacto para subirla.');
    } catch (error) {
      this.notificationService.error('❌ Error al cargar la imagen');
      console.error(error);
    }
  }

  // Remover imagen seleccionada
  removeImage(): void {
    this.selectedImageFile = null;
    this.imagePreview = null;

    // Limpiar input
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }


  // Editar contacto
  editContact(contact: Contact): void {
    // Verificar permisos
    if (!this.roleService.hasPermission('canEdit')) {
      this.notificationService.warning('⚠️ No tienes permisos para editar contactos');
      return;
    }

    this.editingId = contact.id || null;
    this.contactForm.patchValue({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      contactType: contact.contactType
    });
    this.showForm = true;
    this.scrollToTop();
  }

  // Validar duplicados
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

  // Buscar duplicado por email
  private findDuplicateByEmail(email: string): Contact | undefined {
    return this.contacts.find(contact => {
      if (this.editingId && contact.id === this.editingId) return false;
      return contact.email.toLowerCase() === email.toLowerCase();
    });
  }

  // Buscar duplicado por teléfono
  private findDuplicateByPhone(phone: string): Contact | undefined {
    return this.contacts.find(contact => {
      if (this.editingId && contact.id === this.editingId) return false;
      return contact.phone === phone;
    });
  }

  // Enviar formulario
  async onSubmit(): Promise<void> {
    if (!this.contactForm.valid) {
      this.notificationService.warning('⚠️ Por favor completa todos los campos correctamente');
      return;
    }

    // Verificar permisos para crear
    if (!this.editingId && !this.roleService.hasPermission('canCreate')) {
      this.notificationService.warning('⚠️ No tienes permisos para crear contactos');
      return;
    }

    const formData = this.contactForm.value;

    // Validar duplicados solo al crear
    if (!this.editingId) {
      const validation = this.validateDuplicates(formData.email, formData.phone);
      if (validation.isDuplicate) {
        this.notificationService.warning(validation.message);
        return;
      }
    }

    await this.saveContact(formData);
  }

  // Guardar contacto
  private async saveContact(formData: any): Promise<void> {
    this.submitting = true;

    try {
      let photoURL: string | undefined = undefined;

      // Si hay imagen seleccionada, subirla primero
      if (this.selectedImageFile) {
        this.uploadingImage = true;
        try {
          const tempId = this.editingId || `temp_${Date.now()}`;
          photoURL = await this.storageService.uploadContactImage(
            this.selectedImageFile,
            tempId
          );
          this.notificationService.success('📷 Imagen subida exitosamente');
        } catch (error) {
          this.notificationService.warning('⚠️ Error al subir imagen, se guardará sin foto');
          console.error(error);
        } finally {
          this.uploadingImage = false;
        }
      }

      const contactData = {
        ...formData,
        userId: this.authService.currentUser?.uid,
        ...(photoURL && { photoURL }) // Solo añadir si existe
      };

      if (this.editingId) {
        await this.contactService.updateContact(this.editingId, contactData);
        this.notificationService.success(`✅ ${formData.firstName} ${formData.lastName} actualizado exitosamente`);
      } else {
        await this.contactService.addContact(contactData);
        this.notificationService.success(`✅ ${formData.firstName} ${formData.lastName} agregado exitosamente`);
      }

      this.toggleForm();
      await this.reloadContacts();
    } catch (error) {
      console.error('Error al guardar:', error);
      this.notificationService.error('❌ Error al guardar el contacto. Por favor, intenta nuevamente.');
    } finally {
      this.submitting = false;
    }
  }


  // Eliminar contacto
  async deleteContact(contact: Contact): Promise<void> {
    // Verificar permisos
    if (!this.roleService.hasPermission('canDelete')) {
      this.notificationService.warning('⚠️ No tienes permisos para eliminar contactos');
      return;
    }

    const confirmed = confirm(
      `¿Estás seguro de eliminar este contacto?\n\n` +
      `👤 ${contact.firstName} ${contact.lastName}\n` +
      `📧 ${contact.email}\n` +
      `📱 ${contact.phone}`
    );

    if (!confirmed || !contact.id) return;

    try {
      await this.contactService.deleteContact(contact.id);
      this.notificationService.success(`✅ ${contact.firstName} ${contact.lastName} eliminado exitosamente`);
      await this.reloadContacts();
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.notificationService.error('❌ Error al eliminar el contacto. Por favor, intenta nuevamente.');
    }
  }

  // Filtrar contactos
  filterContacts(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase().trim();
    this.applySearchFilter();
  }

  // Aplicar filtro de búsqueda
  private applySearchFilter(): void {
    if (!this.searchTerm) {
      this.filteredContacts = [...this.contacts];
      return;
    }

    this.filteredContacts = this.contacts.filter(contact => 
      this.matchesSearchTerm(contact, this.searchTerm)
    );
  }

  // Verificar si coincide con el término
  private matchesSearchTerm(contact: Contact, term: string): boolean {
    const searchableFields = [
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.phone,
      contact.contactType,
      `${contact.firstName} ${contact.lastName}`
    ];

    return searchableFields.some(field => 
      field.toLowerCase().includes(term)
    );
  }

  // Scroll al tope
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

  // Verificar si puede eliminar
  get canDelete(): boolean {
    return this.roleService.hasPermission('canDelete');
  }

  // Verificar si puede editar
  get canEdit(): boolean {
    return this.roleService.hasPermission('canEdit');
  }

  logout(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}