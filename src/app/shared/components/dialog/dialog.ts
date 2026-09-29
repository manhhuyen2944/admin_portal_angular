import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  DOCUMENT,
  inject,
} from '@angular/core';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIZE_CLASSES: Record<DialogSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-[95vw]',
};

/**
 * Dialog — modal overlay with header/body/footer named slots.
 * Closes on Escape key, backdrop click (configurable), and close button.
 *
 * Usage:
 *   <app-dialog [(open)]="isOpen" title="Edit User">
 *     <ng-container dialog-body>
 *       <app-form-field label="Name"><app-input formControlName="name" /></app-form-field>
 *     </ng-container>
 *     <ng-container dialog-footer>
 *       <app-button variant="outline" (clicked)="isOpen = false">Cancel</app-button>
 *       <app-button variant="primary" (clicked)="save()">Save</app-button>
 *     </ng-container>
 *   </app-dialog>
 *
 * Responsive:
 *   Mobile  — bottom-sheet style (full width, rounded top corners, drag handle, safe-area inset)
 *   Desktop — centered modal with rounded corners and size classes
 *
 * Footer buttons:
 *   Mobile  — stacked vertically, full-width (col-reverse order: primary on top)
 *   Desktop — inline row, auto-width, right-aligned
 */
@Component({
  selector: 'app-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <!-- Backdrop wrapper -->
      <div
        class="fixed inset-0 z-[var(--z-dialog)] flex items-center justify-center p-4"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-label]="title() || 'Dialog'"
        (keydown.escape)="handleEscape()"
      >
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-150"
          (click)="handleBackdrop()"
          aria-hidden="true"
        ></div>

        <!-- Panel -->
        <div
          [class]="panelClasses()"
          role="document"
          (click)="$event.stopPropagation()"
        >


          <!-- Header -->
          <div class="flex items-start justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0">
            <div class="min-w-0 pr-3 pt-0.5">
              @if (title()) {
                <h2 class="text-base sm:text-lg font-semibold text-foreground leading-snug">{{ title() }}</h2>
              }
              @if (description()) {
                <p class="text-xs sm:text-sm text-muted mt-1 leading-relaxed">{{ description() }}</p>
              }
              <ng-content select="[dialog-header]" />
            </div>
            @if (showClose()) {
              <button
                type="button"
                class="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-muted
                       hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label="Close dialog"
                (click)="close()"
              >
                <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round"/>
                </svg>
              </button>
            }
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5 min-h-0">
            <ng-content select="[dialog-body]" />
            <ng-content />
          </div>

          <!-- Footer: Cancel (left) ↔ Primary action (right) -->
          <div
            class="flex flex-row items-center justify-between
                   gap-2.5 px-4 sm:px-6 py-3.5 border-t border-border shrink-0"
          >
            <ng-content select="[dialog-footer]" />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `],
})
export class DialogComponent {
  open = model(false);
  title = input<string | undefined>(undefined);
  description = input<string | undefined>(undefined);
  size = input<DialogSize>('md');
  showClose = input(true);
  /** Whether clicking the backdrop closes the dialog. Default: true. */
  closeOnBackdrop = input(true);

  closed = output<void>();

  private readonly doc = inject(DOCUMENT);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.doc.body.style.overflow = 'hidden';
      } else {
        this.doc.body.style.overflow = '';
      }
    });
  }

  protected readonly panelClasses = computed(() => {
    const base = [
      'relative flex flex-col bg-surface',
      // Always centered, fully rounded on all screen sizes
      'w-full rounded-2xl',
      // Max height with scroll support
      'max-h-[90dvh]',
      'shadow-2xl',
      'z-[calc(var(--z-dialog)+1)] overflow-hidden',
      // Enter animation: zoom in + fade on all screens
      'animate-in fade-in-0 zoom-in-95 duration-200',
    ].join(' ');
    return `${base} ${SIZE_CLASSES[this.size()]}`;
  });

  protected handleBackdrop(): void {
    if (this.closeOnBackdrop()) this.close();
  }

  protected handleEscape(): void { this.close(); }

  protected close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
