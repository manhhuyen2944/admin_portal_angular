import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon';

export interface BreadcrumbItem {
  label: string;
  /** When set, renders as a link. */
  link?: string;
}

/**
 * Breadcrumb — navigation trail.
 * The last item is always the current page (not linked, aria-current="page").
 *
 * Usage:
 *   <app-breadcrumb [items]="[
 *     { label: 'Dashboard', link: '/dashboard' },
 *     { label: 'Users', link: '/users' },
 *     { label: 'Edit User' }
 *   ]" />
 *
 *   <!-- Inside PageHeader's breadcrumb slot: -->
 *   <app-page-header title="Edit User">
 *     <ng-container breadcrumb>
 *       <app-breadcrumb [items]="breadcrumbs" />
 *     </ng-container>
 *   </app-page-header>
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <nav aria-label="Breadcrumb" class="flex">
      <ol class="flex flex-wrap items-center gap-1 text-sm">
        @for (item of items(); track $index; let last = $last) {
          <li class="flex items-center gap-1">
            @if (!last && item.link) {
              <a
                [routerLink]="item.link"
                class="text-muted hover:text-foreground transition-colors"
              >
                {{ item.label }}
              </a>
            } @else if (!last) {
              <span class="text-muted">{{ item.label }}</span>
            } @else {
              <span class="font-medium text-foreground" aria-current="page">{{ item.label }}</span>
            }

            @if (!last) {
              <app-icon name="chevron-right" size="xs" class="text-muted shrink-0" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  items = input.required<BreadcrumbItem[]>();
}
