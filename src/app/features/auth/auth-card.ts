import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/components/icon/icon';

/**
 * AuthCard — standardized card container for authentication screens.
 */
@Component({
  selector: 'app-auth-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-raised/40">
      <div class="w-full max-w-md">
        <!-- Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4">
            <app-icon name="shield" size="md" class="text-white" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="text-sm text-muted mt-2">{{ subtitle() }}</p>
          }
        </div>

        <!-- Card Container -->
        <div class="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl">
          <ng-content />
        </div>

        <!-- Footer slot -->
        <div class="text-center mt-6">
          <ng-content select="[auth-footer]" />
        </div>
      </div>
    </div>
  `,
})
export class AuthCardComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>(undefined);
}
