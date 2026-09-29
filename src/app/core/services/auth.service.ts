import { computed, Injectable, signal } from '@angular/core';
import type { AppRole } from '../../shared/components/role-badge/role-badge';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: AppRole;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface ResetPasswordPayload {
  email?: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  logoutOtherSessions?: boolean;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
  type?: 'reset-password' | 'email-verification';
}

/**
 * AuthService — Centralized Authentication & Authorization Logic.
 * Decouples business logic, API requests, session management, and state from UI presentation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<CurrentUser | null>({
    id: 'user-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@company.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'manage_users', 'view_reports', 'manage_settings'],
  });

  private readonly _isLocked = signal(false);

  readonly user = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isLocked = this._isLocked.asReadonly();
  readonly userRole = computed(() => this._currentUser()?.role);
  readonly userPermissions = computed(() => this._currentUser()?.permissions ?? []);

  // ──────────────────────────────────────────
  // Permission & Role Checks
  // ──────────────────────────────────────────
  hasRole(role: AppRole | AppRole[]): boolean {
    const current = this.userRole();
    if (!current) return false;
    if (Array.isArray(role)) {
      return role.includes(current);
    }
    return current === role;
  }

  hasPermission(permission: string | string[]): boolean {
    const perms = this.userPermissions();
    if (Array.isArray(permission)) {
      return permission.every(p => perms.includes(p));
    }
    return perms.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const perms = this.userPermissions();
    return permissions.some(p => perms.includes(p));
  }

  // ──────────────────────────────────────────
  // Authentication Business Logic
  // ──────────────────────────────────────────

  /** Set user state directly (session restore or demo switching) */
  setUser(user: CurrentUser | null): void {
    this._currentUser.set(user);
    if (user) this._isLocked.set(false);
  }

  /** Sign in with email and password, or directly authenticate user object */
  async login(credentials: LoginCredentials | CurrentUser): Promise<CurrentUser> {
    if ('role' in credentials && 'id' in credentials) {
      this.setUser(credentials as CurrentUser);
      return credentials as CurrentUser;
    }

    await this.delay(650);

    if (credentials.email === 'invalid@company.com') {
      throw new Error('Invalid email or password combination.');
    }

    const user: CurrentUser = {
      id: 'user-' + Date.now(),
      name: credentials.email.split('@')[0].replace('.', ' '),
      email: credentials.email,
      role: 'admin',
      permissions: ['read', 'write', 'manage_users', 'view_reports'],
    };

    this.setUser(user);
    return user;
  }

  /** Sign in with OAuth provider (Google, GitHub) */
  async loginWithOAuth(provider: 'google' | 'github'): Promise<CurrentUser> {
    await this.delay(500);
    const user: CurrentUser = {
      id: 'oauth-' + Date.now(),
      name: `${provider.toUpperCase()} User`,
      email: `user@${provider}.com`,
      role: 'admin',
      permissions: ['read', 'write'],
    };
    this._currentUser.set(user);
    return user;
  }

  /** Send password reset request email */
  async requestPasswordReset(email: string): Promise<void> {
    await this.delay(500);
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
  }

  /** Verify 6-digit OTP code */
  async verifyOtp(payload: VerifyOtpPayload): Promise<boolean> {
    await this.delay(600);
    if (payload.code === '000000') {
      throw new Error('Invalid or expired verification code. Please check and try again.');
    }
    return true;
  }

  /** Resend verification code with cooldown logic */
  async resendOtp(email: string): Promise<void> {
    await this.delay(500);
    if (!email) {
      throw new Error('Email address is missing.');
    }
  }

  /** Reset password after OTP verification */
  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await this.delay(650);
    if (payload.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }
  }

  /** Change password with session revocation option */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await this.delay(600);
    if (!payload.oldPassword || !payload.newPassword) {
      throw new Error('Please fill in both current and new password.');
    }
    if (payload.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters.');
    }
  }

  /** Verify 2FA TOTP code or backup code */
  async verify2Fa(code: string): Promise<boolean> {
    await this.delay(600);
    if (code === '000000') {
      throw new Error('Invalid authentication code. Please check your authenticator clock.');
    }
    return true;
  }

  /** Activate 2FA pairing with authenticator app */
  async activate2Fa(code: string): Promise<boolean> {
    await this.delay(650);
    if (code === '000000') {
      throw new Error('Could not pair authenticator. Invalid confirmation code.');
    }
    return true;
  }

  /** Unlock locked session */
  async unlockSession(password: string): Promise<boolean> {
    await this.delay(500);
    if (!password) {
      throw new Error('Please enter your password.');
    }
    if (password === 'wrong') {
      throw new Error('Incorrect password. Please try again.');
    }
    this._isLocked.set(false);
    return true;
  }

  /** Lock session */
  lockSession(): void {
    this._isLocked.set(true);
  }

  /** Logout */
  logout(): void {
    this._currentUser.set(null);
    this._isLocked.set(false);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
