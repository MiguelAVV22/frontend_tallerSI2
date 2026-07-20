import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  telefono: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface RegisterPayload {
  email: string;
  username: string;
  full_name?: string;
  password: string;
  tenant_id: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/api/acceso`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY  = 'taller_user';

  constructor(private http: HttpClient) {}

  getPublicTenants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/tenants/public`);
  }

  register(payload: RegisterPayload): Observable<AuthToken> {
    return this.http
      .post<AuthToken>(`${this.API}/register`, payload)
      .pipe(tap(res => this.saveSession(res)));
  }

  login(payload: LoginPayload): Observable<AuthToken> {
    return this.http
      .post<AuthToken>(`${this.API}/login`, payload)
      .pipe(tap(res => this.saveSession(res)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{msg: string}> {
    return this.http.post<{msg: string}>(`${this.API}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  requestReset(email: string): Observable<{msg: string}> {
    return this.http.post<{msg: string}>(`${this.API}/request-reset`, { email });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<{msg: string}> {
    return this.http.post<{msg: string}>(`${this.API}/reset-password`, {
      email,
      code,
      new_password: newPassword,
    });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): UserResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private saveSession(auth: AuthToken): void {
    localStorage.setItem(this.TOKEN_KEY, auth.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(auth.user));
  }
}
