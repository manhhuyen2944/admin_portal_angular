import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip directive — shows a tooltip hint on hover and focus.
 * Attach to any element.
 *
 * Usage:
 *   <app-icon-button name="trash" label="Delete" appTooltip="Delete item" />
 *   <span appTooltip="Premium feature" tooltipPosition="right">Help</span>
 *   <button appTooltip="Saved!" tooltipPosition="top">Save</button>
 *
 * Rules:
 *   - Use for decorative hints only; for semantic descriptions use aria-describedby.
 *   - Do NOT use tooltip for required information — it is keyboard accessible only on focus.
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
  host: {
    'class': 'relative',
    '[attr.data-tooltip]': 'appTooltip()',
  },
})
export class TooltipDirective {
  appTooltip = input.required<string>();
  tooltipPosition = input<TooltipPosition>('top');
  tooltipDelay = input(300);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private tooltipEl: HTMLElement | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;

  @HostListener('mouseenter')
  @HostListener('focusin')
  show(): void {
    this.showTimeout = setTimeout(() => this.createTooltip(), this.tooltipDelay());
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  hide(): void {
    if (this.showTimeout) clearTimeout(this.showTimeout);
    this.removeTooltip();
  }

  private createTooltip(): void {
    if (this.tooltipEl) return;

    const tip = document.createElement('div');
    tip.textContent = this.appTooltip();
    tip.setAttribute('role', 'tooltip');
    tip.style.cssText = `
      position: fixed;
      z-index: var(--z-tooltip, 1070);
      background: #1e293b;
      color: #f8fafc;
      font-size: 0.75rem;
      line-height: 1.4;
      padding: 0.375rem 0.625rem;
      border-radius: 0.375rem;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.2);
      transition: opacity 150ms ease;
      opacity: 0;
    `;
    document.body.appendChild(tip);
    this.tooltipEl = tip;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const pos = this.tooltipPosition();

    requestAnimationFrame(() => {
      if (!tip) return;
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;

      let top = 0, left = 0;
      const gap = 6;

      switch (pos) {
        case 'top':
          top = rect.top - th - gap;
          left = rect.left + (rect.width - tw) / 2;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + (rect.width - tw) / 2;
          break;
        case 'left':
          top = rect.top + (rect.height - th) / 2;
          left = rect.left - tw - gap;
          break;
        case 'right':
          top = rect.top + (rect.height - th) / 2;
          left = rect.right + gap;
          break;
      }

      tip.style.top = `${top}px`;
      tip.style.left = `${left}px`;
      tip.style.opacity = '1';
    });
  }

  private removeTooltip(): void {
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
  }
}
