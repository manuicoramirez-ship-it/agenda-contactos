import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }

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
        this.successMessage = 'Usuario creado exitosamente. Redirigiendo...';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
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