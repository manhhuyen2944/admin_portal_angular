import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';
import { ButtonComponent } from '../button/button';

/**
 * EmptyState — placeholder when there is no data to show.
 *
 * Usage:
 *   <app-empty-state
 *     title="No projects yet"
 *     description="Get started by creating your very first project."
 *     actionLabel="Create Project"
 *     actionIcon="plus"
 *     (actionClick)="openCreateModal()"
 *   />
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, ButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto">
      <!-- Icon illustration circle -->
      <div class="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-surface-raised border border-border shadow-xs mb-4">
        <ng-content select="[empty-icon]">
          <app-icon [name]="icon()" size="lg" class="text-muted" />
        </ng-content>
      </div>

      <!-- Text -->
      <h3 class="text-base sm:text-lg font-semibold text-foreground">{{ title() }}</h3>
      @if (description()) {
        <p class="text-sm text-muted mt-1.5 max-w-sm leading-relaxed">{{ description() }}</p>
      }

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-center gap-3 mt-6">
        @if (actionLabel()) {
          <app-button
            variant="primary"
            size="sm"
            [icon]="actionIcon()"
            (click)="actionClick.emit()"
          >
            {{ actionLabel() }}
          </app-button>
        }
        @if (secondaryActionLabel()) {
          <app-button
            variant="outline"
            size="sm"
            (click)="secondaryActionClick.emit()"
          >
            {{ secondaryActionLabel() }}
          </app-button>
        }
        <ng-content select="[empty-actions]" />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input<IconName>('inbox');
  title = input('No data found');
  description = input<string | undefined>('There are no items to display at this time.');
  actionLabel = input<string | undefined>(undefined);
  actionIcon = input<IconName | undefined>(undefined);
  secondaryActionLabel = input<string | undefined>(undefined);

  actionClick = output<void>();
  secondaryActionClick = output<void>();
}
