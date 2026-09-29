import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface ToastOptions {
  description?: string;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
  id?: string;
}

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number; // 0 = persistent / manual dismiss
  dismissible: boolean;
  action?: ToastAction;
  createdAt: number;
}

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 0, // sticky by default
};

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<ToastItem[]>([]);
  readonly toasts = this._toasts.asReadonly();

  readonly maxVisible = 4;

  show(config: { variant: ToastVariant; title: string } & ToastOptions): string {
    const current = this._toasts();

    // Deduplication within 2s for identical title + variant
    const now = Date.now();
    const duplicate = current.find(
      t => t.title === config.title && t.variant === config.variant && now - t.createdAt < 2000
    );
    if (duplicate) return duplicate.id;

    const id = config.id || `toast-${now}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = config.duration !== undefined ? config.duration : DEFAULT_DURATIONS[config.variant];

    const newItem: ToastItem = {
      id,
      variant: config.variant,
      title: config.title,
      description: config.description,
      duration,
      dismissible: config.dismissible ?? true,
      action: config.action,
      createdAt: now,
    };

    this._toasts.update(list => {
      const next = [...list, newItem];
      // Keep only up to maxVisible, removing oldest
      return next.slice(-this.maxVisible);
    });

    return id;
  }

  success(title: string, opts?: ToastOptions): string {
    return this.show({ variant: 'success', title, ...opts });
  }

  error(title: string, opts?: ToastOptions): string {
    return this.show({ variant: 'error', title, ...opts });
  }

  warning(title: string, opts?: ToastOptions): string {
    return this.show({ variant: 'warning', title, ...opts });
  }

  info(title: string, opts?: ToastOptions): string {
    return this.show({ variant: 'info', title, ...opts });
  }

  dismiss(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
