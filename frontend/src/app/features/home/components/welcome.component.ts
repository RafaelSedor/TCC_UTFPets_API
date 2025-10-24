import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-purple-700 relative overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 right-0 w-96 h-96 bg-accent-400 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Header -->
        <div class="text-center mb-16 pt-8">
          <div class="flex justify-center mb-6">
            <div class="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
              <svg class="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 class="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Bem-vindo ao UTFPets!
          </h1>
          <p class="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
            A forma mais moderna e intuitiva de cuidar dos seus pets com amor e tecnologia
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <!-- Feature 1: Pets -->
          <div class="group bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div class="w-16 h-16 bg-accent-400 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Gerenciamento Completo</h3>
            <p class="text-primary-100 leading-relaxed">
              Cadastre seus pets, registre informações importantes e mantenha tudo organizado em um só lugar
            </p>
          </div>

          <!-- Feature 2: Meals -->
          <div class="group bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div class="w-16 h-16 bg-green-400 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Controle de Alimentação</h3>
            <p class="text-primary-100 leading-relaxed">
              Registre refeições, defina lembretes e acompanhe a nutrição do seu pet de forma inteligente
            </p>
          </div>

          <!-- Feature 3: Sharing -->
          <div class="group bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div class="w-16 h-16 bg-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Compartilhamento Seguro</h3>
            <p class="text-primary-100 leading-relaxed">
              Compartilhe o cuidado dos seus pets com família e amigos de forma colaborativa e segura
            </p>
          </div>
        </div>

        <!-- Additional Features -->
        <div class="max-w-4xl mx-auto mb-16">
          <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div class="text-4xl font-bold text-white mb-2">📍</div>
                <p class="text-primary-100 font-medium">Localizações</p>
              </div>
              <div>
                <div class="text-4xl font-bold text-white mb-2">🔔</div>
                <p class="text-primary-100 font-medium">Lembretes</p>
              </div>
              <div>
                <div class="text-4xl font-bold text-white mb-2">📊</div>
                <p class="text-primary-100 font-medium">Relatórios</p>
              </div>
              <div>
                <div class="text-4xl font-bold text-white mb-2">🔒</div>
                <p class="text-primary-100 font-medium">Segurança</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="text-center max-w-md mx-auto space-y-4">
          <a
            routerLink="/auth/register"
            class="block w-full bg-accent-400 hover:bg-accent-500 text-gray-900 font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg"
          >
            <span class="flex items-center justify-center space-x-2">
              <span>Começar Agora</span>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
          <a
            routerLink="/auth/login"
            class="block w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-4 px-8 rounded-xl border-2 border-white border-opacity-40 hover:border-opacity-60 backdrop-blur-sm transition-all duration-200 text-lg"
          >
            Já tenho uma conta
          </a>
        </div>

        <!-- Footer -->
        <div class="text-center mt-16">
          <p class="text-primary-100 text-sm">
            Feito com ❤️ para você e seus pets | UTFPets © 2025
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WelcomeComponent {}