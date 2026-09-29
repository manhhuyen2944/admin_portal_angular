import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import type { AppRole } from '../../components/role-badge/role-badge';

/**
 * RoleGateDirective — structural directive to conditionally render content based on user roles.
 *
 * Usage:
 *   <!-- Single role -->
 *   <div *appRoleGate="'admin'">
 *     Admin Dashboard
 *   </div>
 *
 *   <!-- Multiple allowed roles -->
 *   <button *appRoleGate="['admin', 'manager']">
 *     Approve Request
 *   </button>
 *
 *   <!-- With fallback template -->
 *   <div *appRoleGate="'super_admin'; else: restrictedTpl">
 *     Sensitive System Settings
 *   </div>
 *   <ng-template #restrictedTpl><p>Only Super Admins can edit this.</p></ng-template>
 */
@Directive({
  selector: '[appRoleGate]',
  standalone: true,
})
export class RoleGateDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  appRoleGate = input.required<AppRole | AppRole[]>();
  appRoleGateElse = input<TemplateRef<unknown> | null>(null);

  private hasView = false;

  constructor() {
    effect(() => {
      const roles = this.appRoleGate();
      const elseTpl = this.appRoleGateElse();

      // Read reactive signal to track changes
      this.authService.userRole();

      const allowed = this.authService.hasRole(roles);

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
