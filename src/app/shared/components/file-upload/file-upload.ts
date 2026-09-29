import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  /** Object URL for preview */
  previewUrl?: string;
  error?: string;
  progress?: number;
}

/**
 * FileUpload — drag-and-drop + click-to-browse file upload zone.
 *
 * Usage:
 *   <!-- Single file: -->
 *   <app-file-upload formControlName="avatar" [accept]="'image/*'" />
 *
 *   <!-- Multiple files with size limit: -->
 *   <app-file-upload [multiple]="true" [maxSizeMb]="5" [accept]="'.pdf,.doc'" formControlName="docs" />
 *
 *   <!-- Listen to files for manual upload logic: -->
 *   <app-file-upload [multiple]="true" (filesAdded)="handleUpload($event)" />
 *
 * Rules:
 *   - Do NOT create AvatarUpload, DocumentUpload as separate components — use accept/multiple/config.
 */
@Component({
  selector: 'app-file-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FileUploadComponent),
    multi: true,
  }],
  template: `
    <div class="flex flex-col gap-3 w-full">
      <!-- Drop zone -->
      <div
        [class]="dropZoneClasses()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
        role="button"
        tabindex="0"
        [attr.aria-disabled]="isDisabled()"
        (keydown.enter)="fileInput.click()"
        (keydown.space)="fileInput.click(); $event.preventDefault()"
      >
        <input
          #fileInput
          type="file"
          class="sr-only"
          [accept]="accept()"
          [multiple]="multiple()"
          [disabled]="isDisabled()"
          (change)="onFileInputChange($event)"
        />

        <div class="flex flex-col items-center gap-3 text-center pointer-events-none">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <app-icon
              [name]="isDragging() ? 'download' : 'upload'"
              size="md"
              class="text-primary"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">
              <span class="text-primary">Click to upload</span>
              &nbsp;or drag and drop
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ acceptLabel() }}
              @if (maxSizeMb()) {
                &nbsp;· Max {{ maxSizeMb() }}MB
              }
              @if (multiple()) {
                &nbsp;· Multiple files allowed
              }
            </p>
          </div>
        </div>
      </div>

      <!-- File list -->
      @if (files().length > 0) {
        <ul class="flex flex-col gap-2">
          @for (file of files(); track file.id) {
            <li class="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
              <!-- File type icon -->
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised">
                <app-icon [name]="fileIcon(file)" size="sm" class="text-muted" />
              </div>

              <!-- File info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ file.name }}</p>
                <p class="text-xs text-muted">{{ formatSize(file.size) }}</p>

                @if (file.error) {
                  <p class="text-xs text-danger mt-0.5">{{ file.error }}</p>
                }
                @if (file.progress !== undefined && !file.error) {
                  <div class="mt-1.5 h-1 w-full rounded-full bg-border overflow-hidden">
                    <div
                      class="h-full rounded-full bg-primary transition-all"
                      [style.width]="file.progress + '%'"
                    ></div>
                  </div>
                }
              </div>

              <!-- Remove button -->
              <button
                type="button"
                class="shrink-0 text-muted hover:text-danger transition-colors p-1 rounded"
                aria-label="Remove file"
                (click)="removeFile(file.id)"
              >
                <app-icon name="x" size="xs" />
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class FileUploadComponent implements ControlValueAccessor {
  accept = input('*/*');
  multiple = input(false);
  maxSizeMb = input<number | undefined>(undefined);

  /** Emitted with newly added files (before they are uploaded). */
  filesAdded = output<File[]>();
  /** Emitted when a file is removed by the user. */
  fileRemoved = output<string>();

  protected readonly files = signal<UploadedFile[]>([]);
  protected readonly isDisabled = signal(false);
  protected readonly isDragging = signal(false);

  protected readonly acceptLabel = computed(() => {
    if (this.accept() === '*/*') return 'Any file type';
    return this.accept().split(',').map(a => a.trim()).join(', ');
  });

  protected readonly dropZoneClasses = computed(() => {
    const base = [
      'flex items-center justify-center rounded-xl border-2 border-dashed',
      'px-6 py-10 cursor-pointer transition-colors duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
    ].join(' ');
    const drag = this.isDragging() ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface-raised';
    const dis = this.isDisabled() ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    return `${base} ${drag} ${dis}`;
  });

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected onDragLeave(): void { this.isDragging.set(false); }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.processFiles(files);
  }

  protected onFileInputChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.processFiles(files);
    (event.target as HTMLInputElement).value = '';
  }

  private processFiles(files: File[]): void {
    const valid: File[] = [];
    const newEntries: UploadedFile[] = [];

    for (const file of files) {
      const maxBytes = (this.maxSizeMb() ?? 0) * 1024 * 1024;
      const error = maxBytes && file.size > maxBytes
        ? `File too large (max ${this.maxSizeMb()}MB)`
        : undefined;

      newEntries.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        error,
      });

      if (!error) valid.push(file);
    }

    if (!this.multiple()) {
      this.files.set(newEntries.slice(0, 1));
    } else {
      this.files.update(prev => [...prev, ...newEntries]);
    }

    if (valid.length) {
      this.filesAdded.emit(valid);
      const val = this.multiple() ? this.files().map(f => f.file) : (this.files()[0]?.file ?? null);
      this._onChange(val);
    }
  }

  protected removeFile(id: string): void {
    const file = this.files().find(f => f.id === id);
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    this.files.update(prev => prev.filter(f => f.id !== id));
    this.fileRemoved.emit(id);
    const val = this.multiple() ? this.files().map(f => f.file) : null;
    this._onChange(val);
  }

  protected fileIcon(file: UploadedFile): 'image' | 'file-text' | 'file' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf') || file.type.includes('doc')) return 'file-text';
    return 'file';
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private _onChange: (v: File | File[] | null) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(_: File | File[] | null): void { /* files managed internally */ }
  registerOnChange(fn: (v: File | File[] | null) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}
