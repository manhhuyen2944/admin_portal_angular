import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

/**
 * PermissionGateDirective — structural directive to conditionally render content based on user permissions.
 *
 * Usage:
 *   <!-- Single permission -->
 *   <button *appPermissionGate="'delete'">Delete Record</button>
 *
 *   <!-- Multiple permissions (all required by default) -->
 *   <div *appPermissionGate="['write', 'manage_users']">
 *     User Management Tools
 *   </div>
 *
 *   <!-- Any permission match -->
 *   <div *appPermissionGate="['admin', 'moderator']; mode: 'any'">
 *     Admin Actions
 *   </div>
 *
 *   <!-- With fallback template -->
 *   <div *appPermissionGate="'export'; else: noExportTpl">
 *     <button>Export CSV</button>
 *   </div>
 *   <ng-template #noExportTpl><p>Export disabled</p></ng-template>
 */
@Directive({
  selector: '[appPermissionGate]',
  standalone: true,
})
export class PermissionGateDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  appPermissionGate = input.required<string | string[]>();
  appPermissionGateMode = input<'all' | 'any'>('all');
  appPermissionGateElse = input<TemplateRef<unknown> | null>(null);

  private hasView = false;

  constructor() {
    effect(() => {
      const perms = this.appPermissionGate();
      const mode = this.appPermissionGateMode();
      const elseTpl = this.appPermissionGateElse();

      // Read reactive permissions signal to track changes
      this.authService.userPermissions();

      let allowed = false;
      if (Array.isArray(perms)) {
        allowed = mode === 'any'
          ? this.authService.hasAnyPermission(perms)
          : this.authService.hasPermission(perms);
      } else {
        allowed = this.authService.hasPermission(perms);
      }

      if (allowed) {
        if (!this.hasView) {
          this.viewContainer.clear();
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        }
      } else {
        this.viewContainer.clear();
        this.hasView = false;
        if (elseTpl) {
          this.viewContainer.createEmbeddedView(elseTpl);
        }
      }
    });
  }
}
