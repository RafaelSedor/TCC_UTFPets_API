import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-4 sm:px-6 lg:px-8 py-12">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 -left-20 w-72 h-72 bg-accent-400 opacity-10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div class="max-w-md w-full space-y-8 relative z-10">
        <!-- Logo and Title -->
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <svg class="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h2 class="text-4xl font-bold text-white mb-2">
            Junte-se ao UTFPets! 🎉
          </h2>
          <p class="text-primary-100 text-lg">
            Comece a cuidar melhor do seu pet hoje mesmo
          </p>
        </div>

        <!-- Register Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Name Field -->
            <div>
              <label for="name" class="label-text">
                Nome completo
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  autocomplete="name"
                  class="input-field pl-10"
                  [class.border-red-500]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
                  placeholder="João da Silva"
                />
              </div>
              @if (registerForm.get('name')?.hasError('required') && registerForm.get('name')?.touched) {
                <p class="mt-1 text-sm text-red-600">👤 Nome é obrigatório</p>
              }
            </div>

            <!-- Email Field -->
            <div>
              <label for="email" class="label-text">
                Email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  class="input-field pl-10"
                  [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  placeholder="seu@email.com"
                />
              </div>
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <p class="mt-1 text-sm text-red-600">📧 Email é obrigatório</p>
              }
              @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                <p class="mt-1 text-sm text-red-600">⚠️ Por favor, insira um email válido</p>
              }
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="label-text">
                Senha
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  autocomplete="new-password"
                  class="input-field pl-10"
                  [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                <p class="mt-1 text-sm text-red-600">🔒 Senha é obrigatória</p>
              }
              @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                <p class="mt-1 text-sm text-red-600">🔐 Senha deve ter no mínimo 6 caracteres</p>
              }
            </div>

            <!-- Confirm Password Field -->
            <div>
              <label for="password_confirmation" class="label-text">
                Confirmar senha
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="password_confirmation"
                  type="password"
                  formControlName="password_confirmation"
                  autocomplete="new-password"
                  class="input-field pl-10"
                  [class.border-red-500]="registerForm.hasError('passwordMismatch') && registerForm.get('password_confirmation')?.touched"
                  placeholder="Digite a senha novamente"
                />
              </div>
              @if (registerForm.hasError('passwordMismatch') && registerForm.get('password_confirmation')?.touched) {
                <p class="mt-1 text-sm text-red-600">❌ As senhas não coincidem</p>
              }
            </div>

            <!-- Error Message -->
            @if (errorMessage) {
              <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div class="flex items-center">
                  <svg class="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-red-700">{{ errorMessage }}</p>
                </div>
              </div>
            }

            <!-- Success Message -->
            @if (successMessage) {
              <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div class="flex items-center">
                  <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-green-700">{{ successMessage }}</p>
                </div>
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loading || registerForm.invalid"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 py-3 text-lg"
            >
              @if (loading) {
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Criando sua conta...</span>
              } @else {
                <span>Criar minha conta</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            </button>
          </form>

          <!-- Login Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Já tem uma conta?
              <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-700 transition-colors ml-1">
                Faça login
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-primary-100 text-sm">
          Ao se cadastrar, você concorda com nossos termos de uso
        </p>
      </div>
    </div>
  `,
  styles: []
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
        this.successMessage = '🎉 Conta criada com sucesso! Redirecionando...';
        setTimeout(() => {
          this.router.navigate(['/app/pets']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Ops! Erro ao cadastrar. Tente novamente.';

        if (error.error?.errors) {
          const errors = error.error.errors;
          if (errors.email) {
            this.errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
          }
        }
      }
    });
  }
}
