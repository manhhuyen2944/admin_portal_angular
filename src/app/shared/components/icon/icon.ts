import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ICON_REGISTRY, type IconName } from './icon-registry';


export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * Icon component — single icon system for the entire app.
 *
 * Uses @lucide/angular v2 component-based API via NgComponentOutlet.
 * The rendered SVG inherits `color: currentColor` so set color with Tailwind
 * text-* utility classes on the host element.
 *
 * Usage:
 *   <app-icon name="user" />                          <!-- decorative (aria-hidden) -->
 *   <app-icon name="trash" size="sm" />
 *   <app-icon name="alert-triangle" label="Warning" /> <!-- meaningful (role="img") -->
 *   <app-icon name="user" class="text-primary" />      <!-- color via currentColor -->
 *
 * Rules:
 *   - Never use raw <svg> or emoji in templates — always use this component.
 *   - Color via text-* token classes on parent or on <app-icon> itself.
 *   - To add icons, register them in icon-registry.ts only.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  host: {
    '[attr.aria-hidden]': '!label() ? "true" : null',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    'class': 'inline-flex items-center justify-center shrink-0',
  },
  template: `
    <ng-container
      *ngComponentOutlet="
        iconComponent();
        inputs: iconInputs()
      "
    />
  `,
})
export class IconComponent {
  /** Typed icon name — must exist in ICON_REGISTRY. Typos fail at compile time. */
  name = input.required<IconName>();

  /** xs=12 sm=16 md=20 lg=24 xl=32. Default: md (20px). */
  size = input<IconSize>('md');

  /**
   * Accessible label. Without it the icon is aria-hidden="true".
   * With it: role="img" + aria-label are set on the host.
   */
  label = input<string | undefined>(undefined);

  /** Stroke width override (Lucide default: 2). */
  strokeWidth = input<number>(2);

  protected readonly iconComponent = computed(() => ICON_REGISTRY[this.name()]);

  protected readonly iconInputs = computed(() => ({
    size: SIZE_PX[this.size()],
    strokeWidth: this.strokeWidth(),
    color: 'currentColor',
  }));
}
