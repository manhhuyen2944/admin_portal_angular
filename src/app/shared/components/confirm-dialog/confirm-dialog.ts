import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { DialogComponent } from '../dialog/dialog';
import { ButtonComponent } from '../button/button';
import type { ButtonVariant } from '../button/button';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';

export type ConfirmIntent = 'danger' | 'warning' | 'info' | 'success';
export type ConfirmDialogVariant = ConfirmIntent;

const INTENT_CONFIG: Record<ConfirmIntent, { icon: IconName; iconClass: string; confirmVariant: ButtonVariant }> = {
  danger:  { icon: 'alert-triangle', iconClass: 'text-danger bg-danger/10',  confirmVariant: 'danger' },
  warning: { icon: 'alert-circle',   iconClass: 'text-warning bg-warning/10', confirmVariant: 'warning' },
  info:    { icon: 'info',            iconClass: 'text-info bg-info/10',       confirmVariant: 'primary' },
  success: { icon: 'check-circle',    iconClass: 'text-success bg-success/10', confirmVariant: 'success' },
};

/**
 * ConfirmDialog — standardized destructive-action confirmation dialog.
 * Wraps Dialog with confirm/cancel pattern and intent-based icon/color.
 *
 * Usage:
 *   <app-confirm-dialog
 *     [(open)]="showConfirm"
 *     title="Delete User"
 *     message="This action cannot be undone. Are you sure?"
 *     intent="danger"
 *     confirmText="Delete"
 *     (confirmed)="deleteUser()"
 *   />
 *
 * Rules:
 *   - Use intent="danger" for irreversible actions.
 *   - Do NOT use raw Dialog for confirm patterns — always ConfirmDialog.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogComponent, ButtonComponent, IconComponent],
  template: `
    <app-dialog [(open)]="open" size="sm" [showClose]="false">
      <ng-container dialog-body>
        <div class="flex flex-col items-center text-center gap-4 py-2">
          <!-- Intent icon -->
          <div class="flex h-14 w-14 items-center justify-center rounded-full"
               [class]="config.iconClass">
            <app-icon [name]="config.icon" size="lg" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-foreground">{{ title() }}</h3>
            @if (message()) {
              <p class="mt-2 text-sm text-foreground-secondary">{{ message() }}</p>
            }
          </div>
        </div>
      </ng-container>

      <ng-container dialog-footer>
        <app-button variant="outline" (clicked)="cancel()">
          {{ cancelText() }}
        </app-button>
        <app-button
          [variant]="config.confirmVariant"
          [loading]="loading()"
          (clicked)="confirm()"
        >
          {{ confirmText() }}
        </app-button>
      </ng-container>
    </app-dialog>
  `,
})
export class ConfirmDialogComponent {
  open = model(false);
  title = input.required<string>();
  message = input<string | undefined>(undefined);
  intent = input<ConfirmIntent>('danger');
  confirmText = input('Confirm');
  cancelText = input('Cancel');
  loading = input(false);

  confirmed = output<void>();
  cancelled = output<void>();

  get config() { return INTENT_CONFIG[this.intent()]; }

  protected confirm(): void {
    this.confirmed.emit();
  }

  protected cancel(): void {
    this.open.set(false);
    this.cancelled.emit();
  }
}
