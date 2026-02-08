import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../api';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'geo_token';

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.key);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get userRole(): string | null {
    const token = this.token;
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles: string[] = payload.roles || [];
      return roles[0] || null;
    } catch {
      return null;
    }
  }

  get isProprietaire(): boolean {
    return this.userRole === 'PROPRIETAIRE';
  }

  get isChercheur(): boolean {
    return this.userRole === 'CHERCHEUR';
  }

  get userEmail(): string | null {
    const token = this.token;
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }

  register(email: string, password: string, role: string) {
    return this.http.post<void>(`${API_BASE}/auth/register`, { email, password, role });
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${API_BASE}/auth/login`, { email, password }).pipe(
      tap(res => localStorage.setItem(this.key, res.token))
    );
  }

  logout() {
    localStorage.removeItem(this.key);
  }
}
