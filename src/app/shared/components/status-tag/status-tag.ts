import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { STATUS_MAP, type AppStatus } from '../status-badge/status-badge';
import { IconComponent } from '../icon/icon';

/**
 * StatusTag — tag-style pill with status-color mapping.
 * Use when a status label appears in tag/chip context (filter chips, tag lists).
 * Status → color is always read from STATUS_MAP — never duplicated.
 *
 * Usage:
 *   <app-status-tag status="active" />
 *   <app-status-tag status="pending" [removable]="true" (removed)="clearStatusFilter()" />
 */
@Component({
  selector: 'app-status-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap"
      [class]="config().classes"
    >
      <!-- Status dot -->
      <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
      {{ displayLabel() }}
      @if (removable()) {
        <button
          type="button"
          class="inline-flex shrink-0 items-center justify-center rounded-full hover:bg-black/10 w-3.5 h-3.5"
          [attr.aria-label]="'Remove ' + displayLabel() + ' filter'"
          (click)="removed.emit()"
        >
          <app-icon name="x" size="xs" />
        </button>
      }
    </span>
  `,
})
export class StatusTagComponent {
  status = input.required<AppStatus>();
  label = input<string | undefined>(undefined);
  removable = input(false);

  removed = output<void>();

  protected readonly config = computed(() => STATUS_MAP[this.status()]);
  protected readonly displayLabel = computed(() => this.label() ?? this.config().label);
}
