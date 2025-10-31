import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharingService } from '../services/sharing.service';
import { LocationService, SharedLocationAccess } from '../../locations/services/location.service';
import { SharedPetAccess } from '../../../core/models/shared.model';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Convites de Compartilhamento</h1>
        <p class="text-gray-600 mt-1">Gerencie convites de pets e locations compartilhados com você</p>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        </div>
      } @else {
        <!-- Pet Invitations -->
        @if (pendingPetInvites.length > 0) {
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Convites de Pets</h2>
            <div class="space-y-4">
              @for (invite of pendingPetInvites; track invite.id) {
                <div class="card">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <!-- Pet Icon -->
                      <div class="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                        @if (invite.pet.photo_url) {
                          <img [src]="invite.pet.photo_url" [alt]="invite.pet.name" class="w-full h-full rounded-full object-cover" />
                        } @else {
                          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        }
                      </div>

                      <!-- Invite Info -->
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">{{ invite.pet.name }}</h3>
                        <p class="text-sm text-gray-600">{{ invite.pet.species }}</p>
                        @if (invite.pet.owner) {
                          <p class="text-xs text-gray-500 mt-1">
                            Compartilhado por <strong>{{ invite.pet.owner.name }}</strong>
                          </p>
                        }
                        <span
                          class="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-blue-100 text-blue-800': invite.permission_level === 'read',
                            'bg-green-100 text-green-800': invite.permission_level === 'write'
                          }"
                        >
                          {{ invite.permission_level === 'write' ? 'Pode editar' : 'Somente visualização' }}
                        </span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex space-x-2">
                      <button
                        (click)="acceptPetInvite(invite)"
                        [disabled]="processingInviteId === invite.id"
                        class="btn-primary"
                      >
                        @if (processingInviteId === invite.id) {
                          <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        } @else {
                          Aceitar
                        }
                      </button>
                      <button
                        (click)="declinePetInvite(invite)"
                        [disabled]="processingInviteId === invite.id"
                        class="btn-secondary"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Location Invitations -->
        @if (pendingLocationInvites.length > 0) {
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Convites de Locations</h2>
            <div class="space-y-4">
              @for (invite of pendingLocationInvites; track invite.id) {
                <div class="card">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <!-- Location Icon -->
                      <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>

                      <!-- Invite Info -->
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">{{ invite.location.name }}</h3>
                        @if (invite.location.description) {
                          <p class="text-sm text-gray-600">{{ invite.location.description }}</p>
                        }
                        @if (invite.owner) {
                          <p class="text-xs text-gray-500 mt-1">
                            Compartilhado por <strong>{{ invite.owner.name }}</strong>
                          </p>
                        }
                        <span
                          class="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-blue-100 text-blue-800': invite.role === 'viewer',
                            'bg-green-100 text-green-800': invite.role === 'editor'
                          }"
                        >
                          {{ invite.role === 'editor' ? 'Pode editar' : 'Somente visualização' }}
                        </span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex space-x-2">
                      <button
                        (click)="acceptLocationInvite(invite)"
                        [disabled]="processingLocationInviteId === invite.id"
                        class="btn-primary"
                      >
                        @if (processingLocationInviteId === invite.id) {
                          <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        } @else {
                          Aceitar
                        }
                      </button>
                      <button
                        (click)="declineLocationInvite(invite)"
                        [disabled]="processingLocationInviteId === invite.id"
                        class="btn-secondary"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Empty State -->
        @if (pendingPetInvites.length === 0 && pendingLocationInvites.length === 0) {
          <div class="card text-center py-16">
            <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Nenhum convite pendente</h2>
            <p class="text-gray-600">Você não tem convites de compartilhamento no momento</p>
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class InvitationsComponent implements OnInit {
  private sharingService = inject(SharingService);
  private locationService = inject(LocationService);
  private modalService = inject(ModalService);

  pendingPetInvites: SharedPetAccess[] = [];
  pendingLocationInvites: SharedLocationAccess[] = [];
  loading = true;
  processingInviteId: number | null = null;
  processingLocationInviteId: number | null = null;

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.loading = true;

    // Load pet invitations
    this.sharingService.getSharedWithMe().subscribe({
      next: (invites) => {
        this.pendingPetInvites = invites.filter(i => i.invitation_status === 'pending');
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Erro ao carregar convites de pets:', error);
        this.checkLoadingComplete();
      }
    });

    // Load location invitations
    this.locationService.getSharedLocationsWithMe().subscribe({
      next: (invites) => {
        this.pendingLocationInvites = invites.filter(i => i.invitation_status === 'pending');
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Erro ao carregar convites de locations:', error);
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Simple approach: set timeout to ensure both requests have time to complete
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  acceptPetInvite(invite: SharedPetAccess): void {
    this.processingInviteId = invite.id;
    this.sharingService.acceptPetShare(invite.pet_id, invite.user_id!).subscribe({
      next: () => {
        this.pendingPetInvites = this.pendingPetInvites.filter(i => i.id !== invite.id);
        this.processingInviteId = null;
        this.modalService.success('Convite aceito com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao aceitar convite:', error);
        this.modalService.showBackendError(error, 'Erro ao aceitar convite. Tente novamente.');
        this.processingInviteId = null;
      }
    });
  }

  async declinePetInvite(invite: SharedPetAccess): Promise<void> {
    if (!invite.pet_id || !invite.user_id) {
      console.error('IDs inválidos no convite:', invite);
      return;
    }

    const confirmed = await this.modalService.confirm(
      'Tem certeza que deseja recusar este convite?',
      'Recusar Convite',
      'Recusar',
      'Cancelar'
    );

    if (confirmed) {
      this.processingInviteId = invite.id;
      this.sharingService.revokeAccess(invite.pet_id, invite.user_id).subscribe({
        next: () => {
          this.pendingPetInvites = this.pendingPetInvites.filter(i => i.id !== invite.id);
          this.processingInviteId = null;
          this.modalService.success('Convite recusado.');
        },
        error: (error) => {
          console.error('Erro ao recusar convite:', error);
          this.modalService.showBackendError(error, 'Erro ao recusar convite. Tente novamente.');
          this.processingInviteId = null;
        }
      });
    }
  }

  acceptLocationInvite(invite: SharedLocationAccess): void {
    this.processingLocationInviteId = invite.id;
    this.locationService.acceptLocationInvitation(invite.location_id as any, invite.user_id).subscribe({
      next: () => {
        this.pendingLocationInvites = this.pendingLocationInvites.filter(i => i.id !== invite.id);
        this.processingLocationInviteId = null;
        this.modalService.success('Convite aceito com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao aceitar convite de location:', error);
        this.modalService.showBackendError(error, 'Erro ao aceitar convite. Tente novamente.');
        this.processingLocationInviteId = null;
      }
    });
  }

  async declineLocationInvite(invite: SharedLocationAccess): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Tem certeza que deseja recusar este convite?',
      'Recusar Convite',
      'Recusar',
      'Cancelar'
    );

    if (confirmed) {
      this.processingLocationInviteId = invite.id;
      this.locationService.revokeLocationAccess(invite.location_id as any, invite.user_id).subscribe({
        next: () => {
          this.pendingLocationInvites = this.pendingLocationInvites.filter(i => i.id !== invite.id);
          this.processingLocationInviteId = null;
          this.modalService.success('Convite recusado.');
        },
        error: (error) => {
          console.error('Erro ao recusar convite de location:', error);
          this.modalService.showBackendError(error, 'Erro ao recusar convite. Tente novamente.');
          this.processingLocationInviteId = null;
        }
      });
    }
  }
}
