import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { ButtonComponent } from '../button/button';

export type OfflineDisplayMode = 'screen' | 'banner' | 'card';

/**
 * OfflineState — informs the user that the internet connection has been lost.
 * Automatically listens to window 'online' and 'offline' events in browser environment.
 *
 * Usage:
 *   <!-- As a floating banner at top of viewport -->
 *   <app-offline-state mode="banner" />
 *
 *   <!-- As a centered card / screen placeholder -->
 *   <app-offline-state mode="screen" (reconnect)="checkConnection()" />
 */
@Component({
  selector: 'app-offline-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, ButtonComponent],
  template: `
    @if (isOfflineState()) {
      @if (mode() === 'banner') {
        <div
          class="flex items-center justify-between gap-3 px-4 py-2.5 bg-warning/15 border-b border-warning/30 text-warning-dark w-full animate-in slide-in-from-top-2"
          role="status"
          aria-live="polite"
        >
          <div class="flex items-center gap-2 text-sm font-medium">
            <app-icon name="wifi-off" size="sm" class="text-warning shrink-0" />
            <span>{{ bannerMessage() }}</span>
          </div>
          <app-button
            size="xs"
            variant="outline"
            icon="refresh"
            (click)="handleReconnect()"
          >
            Reconnect
          </app-button>
        </div>
      } @else {
        <div
          [class]="cardContainerClasses()"
          role="status"
          aria-live="polite"
        >
          <!-- Wifi off icon circle -->
          <div class="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-warning/10 border border-warning/20 text-warning mb-4">
            <app-icon name="wifi-off" size="lg" />
          </div>

          <h3 class="text-base sm:text-lg font-semibold text-foreground">{{ title() }}</h3>
          <p class="text-sm text-muted mt-1.5 max-w-sm leading-relaxed">{{ description() }}</p>

          <div class="flex items-center justify-center gap-3 mt-6">
            <app-button
              variant="primary"
              size="sm"
              icon="refresh"
              (click)="handleReconnect()"
            >
              {{ retryLabel() }}
            </app-button>
            <ng-content select="[offline-actions]" />
          </div>
        </div>
      }
    }
  `,
})
export class OfflineStateComponent implements OnInit {
  mode = input<OfflineDisplayMode>('card');
  forceOffline = input<boolean | undefined>(undefined);
  title = input('No Internet Connection');
  description = input('You appear to be offline. Please check your network connection and try again.');
  bannerMessage = input('You are currently offline. Changes may not be saved.');
  retryLabel = input('Check Connection');

  reconnect = output<void>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly isOnline = signal(true);

  protected get isOfflineState(): () => boolean {
    return () => {
      if (this.forceOffline() !== undefined) {
        return !!this.forceOffline();
      }
      return !this.isOnline();
    };
  }

  protected cardContainerClasses(): string {
    const base = 'flex flex-col items-center justify-center text-center mx-auto';
    if (this.mode() === 'screen') {
      return `${base} p-8 sm:p-16 max-w-md`;
    }
    return `${base} p-6 sm:p-8 max-w-md rounded-2xl border border-border bg-surface shadow-xs`;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline.set(navigator.onLine);

      const onOnline = () => this.isOnline.set(true);
      const onOffline = () => this.isOnline.set(false);

      window.addEventListener('online', onOnline);
      window.addEventListener('offline', onOffline);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
      });
    }
  }

  protected handleReconnect(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline.set(navigator.onLine);
    }
    this.reconnect.emit();
  }
}
