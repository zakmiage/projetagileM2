import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [ngClass]="'toast--' + toast.type" role="alert">
          <span class="toast__icon">{{ icon(toast.type) }}</span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)" aria-label="Fermer">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 0.875rem;
      font-weight: 500;
      min-width: 280px;
      max-width: 420px;
      pointer-events: all;
      animation: slideIn 0.25s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    .toast--success { background: #f0fdf4; border-left: 4px solid #22c55e; color: #166534; }
    .toast--error   { background: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b; }
    .toast--warning { background: #fffbeb; border-left: 4px solid #f59e0b; color: #92400e; }
    .toast--info    { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }
    .toast__icon    { font-size: 1rem; flex-shrink: 0; }
    .toast__message { flex: 1; }
    .toast__close   { background: none; border: none; cursor: pointer; padding: 0; font-size: 0.75rem; opacity: 0.6; }
    .toast__close:hover { opacity: 1; }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  icon(type: Toast['type']): string {
    const icons: Record<Toast['type'], string> = {
      success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
    };
    return icons[type];
  }
}
