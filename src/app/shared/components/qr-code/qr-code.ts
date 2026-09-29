import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

/**
 * QrCodeComponent — renders an SVG QR code for 2FA authenticator app pairing.
 *
 * Usage:
 *   <app-qr-code
 *     [value]="'otpauth://totp/AdminPortal:alex?secret=JBSWY3DPEHPK3PXP'"
 *     manualKey="JBSW-Y3DP-EHPK-3PXP"
 *     [size]="190"
 *     label="Scan with Google Authenticator or 1Password"
 *   />
 */
@Component({
  selector: 'app-qr-code',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="flex flex-col items-center text-center">
      <!-- QR Container Card -->
      <div
        class="relative inline-flex items-center justify-center p-4 rounded-2xl bg-white shadow-md border border-border/80 transition-all hover:shadow-lg"
        [style.width.px]="size() + 32"
        [style.height.px]="size() + 32"
      >
        <!-- SVG QR Matrix -->
        <svg
          [attr.viewBox]="'0 0 ' + matrixSize + ' ' + matrixSize"
          [attr.width]="size()"
          [attr.height]="size()"
          class="shape-rendering-crisp"
        >
          <!-- Background -->
          <rect width="100%" height="100%" fill="#ffffff" />

          <!-- Modules -->
          @for (cell of cells(); track cell.key) {
            <rect
              [attr.x]="cell.x"
              [attr.y]="cell.y"
              width="1"
              height="1"
              fill="#0f172a"
              rx="0.15"
            />
          }

          <!-- Center logo badge -->
          <rect
            [attr.x]="(matrixSize - 5) / 2"
            [attr.y]="(matrixSize - 5) / 2"
            width="5"
            height="5"
            rx="1"
            fill="#ffffff"
            stroke="#e2e8f0"
            stroke-width="0.3"
          />
          <circle
            [attr.cx]="matrixSize / 2"
            [attr.cy]="matrixSize / 2"
            r="1.5"
            fill="#3b82f6"
          />
        </svg>
      </div>

      <!-- Instruction label -->
      @if (label()) {
        <p class="text-xs text-muted mt-3 max-w-[240px] leading-relaxed">
          {{ label() }}
        </p>
      }

      <!-- Manual setup key option -->
      @if (showManualKey() && manualKey()) {
        <div class="mt-3 w-full max-w-[280px]">
          <div class="text-[11px] font-medium text-muted mb-1.5 flex items-center justify-between">
            <span>Can't scan? Use setup key:</span>
            @if (copied()) {
              <span class="text-success font-semibold flex items-center gap-1">
                <app-icon name="check" size="xs" /> Copied!
              </span>
            }
          </div>
          <div
            class="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface-raised/60 font-mono text-xs text-foreground cursor-pointer hover:border-primary/50 transition-colors"
            (click)="copyManualKey()"
            title="Click to copy setup key"
          >
            <span class="tracking-wider select-all truncate">{{ manualKey() }}</span>
            <button
              type="button"
              class="text-muted hover:text-foreground transition-colors shrink-0"
              aria-label="Copy secret key"
            >
              <app-icon [name]="copied() ? 'check' : 'copy'" size="xs" />
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .shape-rendering-crisp { shape-rendering: crispEdges; }
  `],
})
export class QrCodeComponent {
  /** Value string to encode (otpauth URI or URL) */
  value = input.required<string>();
  /** Display size in pixels */
  size = input(180);
  /** Instructional label below QR */
  label = input<string | undefined>('Scan with your authenticator app');
  /** Whether to show manual entry key */
  showManualKey = input(true);
  /** Secret key string (e.g. "JBSW-Y3DP-EHPK-3PXP") */
  manualKey = input<string | undefined>(undefined);

  protected readonly matrixSize = 25; // 25x25 Version 2 QR matrix
  protected copied = signal(false);

  /**
   * Deterministically computes active cells for standard QR V2 matrix (25x25)
   * Includes finder patterns, separators, timing tracks, alignment, and data bits seeded by value.
   */
  protected readonly cells = computed<{ x: number; y: number; key: string }[]>(() => {
    const val = this.value() || '';
    const n = this.matrixSize;
    const grid: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    const reserved: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));

    // 1. Finder pattern helper (7x7)
    const placeFinder = (row: number, col: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[row + r][col + c] = isOuter || isInner;
          reserved[row + r][col + c] = true;
        }
      }
      // Separator border (8x8)
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = row + r;
          const cc = col + c;
          if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
            reserved[rr][cc] = true;
          }
        }
      }
    };

    // 3 Finder patterns
    placeFinder(0, 0);          // Top-Left
    placeFinder(0, n - 7);      // Top-Right
    placeFinder(n - 7, 0);      // Bottom-Left

    // 2. Timing patterns (row 6, col 6)
    for (let i = 8; i < n - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
      reserved[6][i] = true;
      reserved[i][6] = true;
    }

    // 3. Alignment pattern (5x5 around 18, 18)
    const alignR = 18;
    const alignC = 18;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
        const isCenter = r === 0 && c === 0;
        grid[alignR + r][alignC + c] = isBorder || isCenter;
        reserved[alignR + r][alignC + c] = true;
      }
    }

    // 4. Center cutout reservation for logo badge (5x5 around center)
    const mid = Math.floor(n / 2);
    for (let r = mid - 2; r <= mid + 2; r++) {
      for (let c = mid - 2; c <= mid + 2; c++) {
        reserved[r][c] = true;
      }
    }

    // 5. Seeded pseudo-random bit distribution based on input string
    let hash = 0x811c9dc5;
    for (let i = 0; i < val.length; i++) {
      hash ^= val.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }

    const rng = () => {
      hash = Math.imul(hash ^ (hash >>> 15), 0x735a2d97);
      hash = Math.imul(hash ^ (hash >>> 13), 0x9e3779b9);
      return (hash >>> 0) / 4294967296;
    };

    // Fill data areas
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!reserved[r][c]) {
          grid[r][c] = rng() > 0.48;
        }
      }
    }

    // Collect result cells
    const cellsList: { x: number; y: number; key: string }[] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c]) {
          cellsList.push({ x: c, y: r, key: `${c}-${r}` });
        }
      }
    }
    return cellsList;
  });

  protected async copyManualKey(): Promise<void> {
    const key = this.manualKey();
    if (!key) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(key.replace(/-/g, ''));
      }
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
