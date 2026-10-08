import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { tap } from 'rxjs';

export const API = 'http://localhost:3000';
const KEY = 'biblioteca_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  get token(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<{ accessToken: string }>(`${API}/auth/login`, { email, password })
      .pipe(tap((r) => localStorage.setItem(KEY, r.accessToken)));
  }

  register(email: string, password: string) {
    return this.http.post(`${API}/auth/register`, { email, password });
  }

  logout() {
    localStorage.removeItem(KEY);
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token;
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.token ? true : inject(Router).createUrlTree(['/login']);
};
