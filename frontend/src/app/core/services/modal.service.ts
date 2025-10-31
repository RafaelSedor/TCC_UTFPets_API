import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
}

export interface ModalState {
  isOpen: boolean;
  config: ModalConfig | null;
  resolveCallback?: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalState = new BehaviorSubject<ModalState>({
    isOpen: false,
    config: null,
    resolveCallback: undefined
  });

  modalState$ = this.modalState.asObservable();

  alert(message: string, title: string = 'Atenção'): Promise<void> {
    return new Promise((resolve) => {
      this.modalState.next({
        isOpen: true,
        config: {
          title,
          message,
          type: 'alert',
          confirmText: 'OK'
        },
        resolveCallback: () => {
          resolve();
        }
      });
    });
  }

  error(message: string, title: string = 'Erro'): Promise<void> {
    return new Promise((resolve) => {
      this.modalState.next({
        isOpen: true,
        config: {
          title,
          message,
          type: 'error',
          confirmText: 'OK'
        },
        resolveCallback: () => {
          resolve();
        }
      });
    });
  }

  success(message: string, title: string = 'Sucesso'): Promise<void> {
    return new Promise((resolve) => {
      this.modalState.next({
        isOpen: true,
        config: {
          title,
          message,
          type: 'success',
          confirmText: 'OK'
        },
        resolveCallback: () => {
          resolve();
        }
      });
    });
  }

  confirm(message: string, title: string = 'Confirmar', confirmText: string = 'Confirmar', cancelText: string = 'Cancelar'): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalState.next({
        isOpen: true,
        config: {
          title,
          message,
          type: 'confirm',
          confirmText,
          cancelText
        },
        resolveCallback: (result: boolean) => {
          resolve(result);
        }
      });
    });
  }

  close(result: boolean = false): void {
    const currentState = this.modalState.value;
    if (currentState.resolveCallback) {
      currentState.resolveCallback(result);
    }
    this.modalState.next({
      isOpen: false,
      config: null,
      resolveCallback: undefined
    });
  }

  /**
   * Extrai a mensagem de erro do backend
   * Tenta várias propriedades comuns onde o backend pode retornar erros
   */
  extractErrorMessage(error: any, defaultMessage: string = 'Ocorreu um erro. Tente novamente.'): string {
    if (!error) return defaultMessage;

    // Tenta extrair a mensagem de várias possíveis localizações
    return error.error?.error ||
           error.error?.message ||
           error.message ||
           defaultMessage;
  }

  /**
   * Mostra um erro extraindo a mensagem do backend automaticamente
   */
  showBackendError(error: any, defaultMessage?: string, title: string = 'Erro'): Promise<void> {
    const message = this.extractErrorMessage(error, defaultMessage);
    return this.error(message, title);
  }
}
