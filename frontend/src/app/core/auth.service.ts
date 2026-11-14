import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export const API_URL = 'http://localhost:3000/api';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

const TOKEN_KEY = 'cf_token';
const USER_KEY = 'cf_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<AuthUser | null>(this.readStoredUser());
  readonly isLoggedIn = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  register(fullName: string, email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, { fullName, email, password })
      .pipe(tap((res) => this.saveSession(res)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(tap((res) => this.saveSession(res)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

   updateStoredName(fullName: string) {
    const current = this.user();
    if (!current) return;
    const updated = { ...current, fullName };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this.user.set(updated);
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.accessToken);
    this.user.set(res.user);
  }

  private readStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}