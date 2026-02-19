import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repuesto, Marca, Modelo, Categoria } from '../models/repuesto.model';

@Injectable({ providedIn: 'root' })
export class RepuestoService {
  private readonly API = '/api';

  constructor(private http: HttpClient) {}

  getRepuestos(filtros?: { marcaId?: number; modeloId?: number; categoriaId?: number; nombre?: string }): Observable<any> {
    let params = new HttpParams();
    if (filtros?.marcaId) params = params.set('marcaId', filtros.marcaId);
    if (filtros?.modeloId) params = params.set('modeloId', filtros.modeloId);
    if (filtros?.categoriaId) params = params.set('categoriaId', filtros.categoriaId);
    if (filtros?.nombre) params = params.set('nombre', filtros.nombre);
    return this.http.get<any>(`${this.API}/repuestos`, { params });
  }

  getRepuesto(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/repuestos/${id}`);
  }

  crearRepuesto(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/repuestos`, data);
  }

  actualizarRepuesto(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.API}/repuestos/${id}`, data);
  }

  eliminarRepuesto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API}/repuestos/${id}`);
  }

  getMarcas(): Observable<any> {
    return this.http.get<any>(`${this.API}/marcas`);
  }

  crearMarca(data: { nombre: string; paisOrigen: string }): Observable<any> {
    return this.http.post<any>(`${this.API}/marcas`, data);
  }

  actualizarMarca(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.API}/marcas/${id}`, data);
  }

  getModelos(marcaId?: number): Observable<any> {
    let params = new HttpParams();
    if (marcaId) params = params.set('marcaId', marcaId);
    return this.http.get<any>(`${this.API}/modelos`, { params });
  }

  crearModelo(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/modelos`, data);
  }

  getCategorias(): Observable<any> {
    return this.http.get<any>(`${this.API}/categorias`);
  }

  uploadImagen(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.API}/upload`, formData);
  }
}
