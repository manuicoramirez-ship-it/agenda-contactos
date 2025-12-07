import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    },
    {
      validators: this.passwordsMatch
    });
  }

  passwordsMatch(form: AbstractControl) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    
    return pass === confirm ? null : { mismatch: true };
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await this.authService.register(
          this.registerForm.value.email,
          this.registerForm.value.password,
          this.registerForm.value.firstName,
          this.registerForm.value.lastName
        );
        
        // ARREGLADO: Mostrar mensaje y esperar 3 segundos
        this.successMessage = '✅ Usuario creado exitosamente. Redirigiendo en 3 segundos...';
        
        // ARREGLADO: Cambiar de 2ms a 3000ms (3 segundos)
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'Este correo ya está registrado';
        } else {
          this.errorMessage = 'Error al crear usuario. Intenta nuevamente';
        }
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  }
}