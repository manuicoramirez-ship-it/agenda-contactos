import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ContactService } from '../../services/contact';
import { NotificationService } from '../../services/notification';
import { RoleService } from '../../services/role';
import { Contact } from '../../models/contact';
import { PhoneFormatPipe } from '../../pipes/phone-format-pipe'; // ← AÑADIR
import { fadeInOut, slideDown, slideInRight } from '../../animations/animations';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PhoneFormatPipe],
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.css'],
  animations: [fadeInOut, slideDown, slideInRight] // ← AÑADIR
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

  constructor() {
    this.contactForm = this.createContactForm();
  }

  async ngOnInit() {
    // 🧪 PRUEBA DE NOTIFICACIONES
    this.notificationService.success('🎉 ¡Probando notificaciones!');
  
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

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.notificationService.error('❌ Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 500KB para Base64)
    if (file.size > 500 * 1024) {
      this.notificationService.error('❌ La imagen no puede superar 500KB');
      return;
    }

    try {
      // Comprimir y convertir a Base64
      const base64Image = await this.compressAndConvertToBase64(file);
    
      this.selectedImageFile = file;
      this.imagePreview = base64Image;
    
      this.notificationService.success('✅ Imagen cargada correctamente');
    } catch (error) {
      this.notificationService.error('❌ Error al procesar la imagen');
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

  // Comprimir imagen y convertir a Base64
  private compressAndConvertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          // Crear canvas para comprimir
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;  // Reducido para Base64
          const MAX_HEIGHT = 400;

          let width = img.width;
          let height = img.height;

          // Calcular nuevas dimensiones
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo obtener contexto del canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a Base64 con compresión
          const base64 = canvas.toDataURL('image/jpeg', 0.7); // Calidad 70%

          // Verificar tamaño (Base64 es ~33% más grande que el archivo)
          const sizeInKB = (base64.length * 3) / 4 / 1024;
          console.log(`📦 Imagen comprimida: ${sizeInKB.toFixed(2)}KB`);

          if (sizeInKB > 800) {
            reject(new Error('La imagen es muy grande después de comprimir'));
            return;
          }

          resolve(base64);
        };

        img.onerror = () => reject(new Error('Error al cargar imagen'));
      };

      reader.onerror = () => reject(new Error('Error al leer archivo'));
    });
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
      // Preparar datos del contacto
      const contactData: any = {
        ...formData,
        userId: this.authService.currentUser?.uid
      };

      // Si hay imagen, añadirla como Base64
      if (this.imagePreview) {
        contactData.photoURL = this.imagePreview; // Base64 directo
        console.log('📷 Imagen incluida en Base64');
      }

      if (this.editingId) {
        await this.contactService.updateContact(this.editingId, contactData);
        this.notificationService.success(`✅ ${formData.firstName} ${formData.lastName} actualizado`);
      } else {
        await this.contactService.addContact(contactData);
        this.notificationService.success(`✅ ${formData.firstName} ${formData.lastName} agregado`);
      }

      this.toggleForm();
      await this.reloadContacts();
    } catch (error) {
      console.error('Error al guardar:', error);
      this.notificationService.error('❌ Error al guardar el contacto');
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

  // Búsqueda
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