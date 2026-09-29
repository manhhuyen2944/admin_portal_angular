import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Card family — generic content container with named sub-components.
 * Always use these instead of raw <div class="rounded-xl border..."> in features.
 *
 * Usage:
 *   <app-card>
 *     <app-card-header>
 *       <app-card-title>Users</app-card-title>
 *       <app-card-description>Manage your team.</app-card-description>
 *     </app-card-header>
 *     <app-card-content>
 *       <!-- content -->
 *     </app-card-content>
 *     <app-card-footer>
 *       <app-button>Save</app-button>
 *     </app-card-footer>
 *   </app-card>
 */

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block rounded-card border border-border bg-surface shadow-sm' },
  template: `<ng-content />`,
})
export class CardComponent {}

@Component({
  selector: 'app-card-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-1 px-6 py-5 border-b border-border' },
  template: `<ng-content />`,
})
export class CardHeaderComponent {}

@Component({
  selector: 'app-card-title',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'text-base font-semibold text-foreground leading-tight' },
  template: `<ng-content />`,
})
export class CardTitleComponent {}

@Component({
  selector: 'app-card-description',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'text-sm text-muted leading-relaxed' },
  template: `<ng-content />`,
})
export class CardDescriptionComponent {}

@Component({
  selector: 'app-card-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block px-6 py-5' },
  template: `<ng-content />`,
})
export class CardContentComponent {}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center justify-end gap-3 px-6 py-4 border-t border-border' },
  template: `<ng-content />`,
})
export class CardFooterComponent {}
