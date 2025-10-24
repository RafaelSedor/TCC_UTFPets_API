import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Cadastre-se no UTFPets</mat-card-title>
          <mat-card-subtitle>Crie sua conta gratuitamente</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="name" autocomplete="name">
              @if (registerForm.get('name')?.hasError('required') && registerForm.get('name')?.touched) {
                <mat-error>Nome é obrigatório</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>Email é obrigatório</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                <mat-error>Email inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password">
              @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                <mat-error>Senha é obrigatória</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                <mat-error>Senha deve ter no mínimo 6 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar Senha</mat-label>
              <input matInput type="password" formControlName="password_confirmation" autocomplete="new-password">
              @if (registerForm.hasError('passwordMismatch') && registerForm.get('password_confirmation')?.touched) {
                <mat-error>As senhas não coincidem</mat-error>
              }
            </mat-form-field>

            @if (errorMessage) {
              <div class="error-message">{{ errorMessage }}</div>
            }

            @if (successMessage) {
              <div class="success-message">{{ successMessage }}</div>
            }

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="loading || registerForm.invalid" class="full-width">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Cadastrar
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="text-center">
            Já tem uma conta?
            <a routerLink="/auth/login">Faça login</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      max-width: 450px;
      width: 100%;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .error-message {
      color: #f44336;
      margin-bottom: 16px;
      text-align: center;
      padding: 8px;
      background-color: #ffebee;
      border-radius: 4px;
    }

    .success-message {
      color: #4caf50;
      margin-bottom: 16px;
      text-align: center;
      padding: 8px;
      background-color: #e8f5e9;
      border-radius: 4px;
    }

    .text-center {
      text-align: center;
      margin: 0;
    }

    mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 28px;
      font-weight: 600;
      color: #667eea;
      text-align: center;
    }

    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirmation');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';
        setTimeout(() => {
          this.router.navigate(['/app/pets']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Erro ao cadastrar. Tente novamente.';

        // Tratar erros específicos
        if (error.error?.errors) {
          const errors = error.error.errors;
          if (errors.email) {
            this.errorMessage = 'Este email já está cadastrado.';
          }
        }
      }
    });
  }
}
