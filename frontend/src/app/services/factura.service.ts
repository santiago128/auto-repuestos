import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FacturaRequest } from '../models/factura.model';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private readonly API = '/api/facturas';

  constructor(private http: HttpClient) {}

  crearFactura(req: FacturaRequest): Observable<any> {
    return this.http.post<any>(this.API, req);
  }

  misFacturas(): Observable<any> {
    return this.http.get<any>(`${this.API}/mis-facturas`);
  }

  obtenerFactura(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`);
  }
}
