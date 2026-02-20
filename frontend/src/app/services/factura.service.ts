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

  descargarPdf(facturaId: number): void {
    this.http.get(`${this.API}/${facturaId}/pdf`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${facturaId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.API}/${id}/estado`, { estado });
  }

  todasLasFacturas(): Observable<any> {
    return this.http.get<any>(`${this.API}/admin/todas`);
  }
}
