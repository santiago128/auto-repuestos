import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, UsuarioSession } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/auth';
  private readonly SESSION_KEY = 'repuestos_session';

  private sessionSubject = new BehaviorSubject<UsuarioSession | null>(this.loadSession());
  session$ = this.sessionSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(req: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, req).pipe(
      tap(res => {
        if (res.success) {
          const session: UsuarioSession = res.data;
          localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
          this.sessionSubject.next(session);
        }
      })
    );
  }

  register(req: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.API}/register`, req);
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.sessionSubject.next(null);
  }

  getSession(): UsuarioSession | null {
    return this.sessionSubject.value;
  }

  getToken(): string | null {
    return this.sessionSubject.value?.token ?? null;
  }

  isLoggedIn(): boolean {
    return this.sessionSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.sessionSubject.value?.rol === 'ADMIN';
  }

  private loadSession(): UsuarioSession | null {
    const stored = localStorage.getItem(this.SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
