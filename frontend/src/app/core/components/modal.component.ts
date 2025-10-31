import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalState } from '../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (modalState?.isOpen && modalState?.config) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        (click)="onBackdropClick()"
      >
        <!-- Modal -->
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div [ngClass]="{
            'bg-gradient-to-r from-blue-500 to-blue-600': modalState?.config?.type === 'alert',
            'bg-gradient-to-r from-red-500 to-red-600': modalState?.config?.type === 'error',
            'bg-gradient-to-r from-green-500 to-green-600': modalState?.config?.type === 'success',
            'bg-gradient-to-r from-amber-500 to-amber-600': modalState?.config?.type === 'confirm'
          }" class="px-6 py-4 rounded-t-2xl">
            <div class="flex items-center space-x-3">
              <!-- Icon -->
              <div class="flex-shrink-0">
                @if (modalState?.config?.type === 'alert') {
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @if (modalState?.config?.type === 'error') {
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @if (modalState?.config?.type === 'success') {
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @if (modalState?.config?.type === 'confirm') {
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              </div>
              <!-- Title -->
              <h3 class="text-xl font-bold text-white">
                {{ modalState?.config?.title }}
              </h3>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 py-6">
            <p class="text-gray-700 text-base leading-relaxed">
              {{ modalState?.config?.message }}
            </p>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            @if (modalState?.config?.type === 'confirm') {
              <button
                (click)="onCancel()"
                class="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                {{ modalState?.config?.cancelText || 'Cancelar' }}
              </button>
              <button
                (click)="onConfirm()"
                class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 shadow-lg"
              >
                {{ modalState?.config?.confirmText || 'Confirmar' }}
              </button>
            } @else {
              <button
                (click)="onConfirm()"
                [ngClass]="{
                  'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500': modalState?.config?.type === 'alert',
                  'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500': modalState?.config?.type === 'error',
                  'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500': modalState?.config?.type === 'success'
                }"
                class="px-6 py-2.5 text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg"
              >
                {{ modalState?.config?.confirmText || 'OK' }}
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class ModalComponent implements OnInit {
  private modalService = inject(ModalService);
  modalState: ModalState | null = null;

  ngOnInit(): void {
    this.modalService.modalState$.subscribe(state => {
      this.modalState = state;
    });
  }

  onConfirm(): void {
    this.modalService.close(true);
  }

  onCancel(): void {
    this.modalService.close(false);
  }

  onBackdropClick(): void {
    if (this.modalState?.config?.type === 'confirm') {
      this.onCancel();
    } else {
      this.onConfirm();
    }
  }
}
