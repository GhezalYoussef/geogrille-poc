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

  register(email: string, password: string) {
    return this.http.post<void>(`${API_BASE}/auth/register`, { email, password });
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
