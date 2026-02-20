import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private readonly API = '/api/favoritos';
  private favoritosIds$ = new BehaviorSubject<Set<number>>(new Set());

  constructor(private http: HttpClient, private authSvc: AuthService) {
    this.authSvc.session$.subscribe(session => {
      if (session) {
        this.cargarIds();
      } else {
        this.favoritosIds$.next(new Set());
      }
    });
  }

  private cargarIds(): void {
    this.http.get<any>(`${this.API}/ids`).subscribe({
      next: r => {
        const ids: number[] = r.data ?? [];
        this.favoritosIds$.next(new Set(ids));
      },
      error: () => {}
    });
  }

  getFavoritos(): Observable<any> {
    return this.http.get<any>(this.API);
  }

  toggleFavorito(repuestoId: number): Observable<any> {
    return this.http.post<any>(`${this.API}/${repuestoId}`, {}).pipe(
      tap(r => {
        if (r.success) {
          const current = new Set(this.favoritosIds$.value);
          if (r.data?.accion === 'AGREGADO') {
            current.add(repuestoId);
          } else {
            current.delete(repuestoId);
          }
          this.favoritosIds$.next(current);
        }
      })
    );
  }

  esFavorito(repuestoId: number): boolean {
    return this.favoritosIds$.value.has(repuestoId);
  }

  getFavoritosIds$(): Observable<Set<number>> {
    return this.favoritosIds$.asObservable();
  }
}
