import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FacturaService } from '../../services/factura.service';
import { Factura } from '../../models/factura.model';

@Component({
  selector: 'app-mis-facturas',
  templateUrl: './mis-facturas.component.html',
  styles: [`
    .page-header {
      margin-bottom: 28px;
      animation: slideInL .4s ease;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -.03em;
    }
    .page-header h1::after {
      content: '';
      display: block;
      width: 40px; height: 4px;
      background: #f59e0b;
      border-radius: 2px;
      margin-top: 6px;
    }
    .factura-card {
      background: white;
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 14px;
      cursor: pointer;
      transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s;
      box-shadow: 0 1px 4px rgba(0,0,0,.07);
      border: 1px solid #e2e8f0;
      animation: slideUp .4s ease both;
    }
    .factura-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(26,47,94,.12);
      border-color: rgba(26,47,94,.2);
    }
    .factura-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }

    /* Estado badges */
    .estado-chip {
      font-size: .72rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      letter-spacing: .04em;
      text-transform: uppercase;
      display: inline-block;
    }
    .estado-PAGADA      { background: #dbeafe; color: #1d4ed8; }
    .estado-EN_PROCESO  { background: #fef3c7; color: #b45309; }
    .estado-ENVIADO     { background: #f3e8ff; color: #7c3aed; }
    .estado-ENTREGADO   { background: #d1fae5; color: #065f46; }
    .estado-CANCELADO   { background: #fee2e2; color: #991b1b; }

    @keyframes slideInL { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class MisFacturasComponent implements OnInit {
  facturas: Factura[] = [];
  cargando = true;
  facturaSeleccionada: Factura | null = null;

  constructor(
    private facturaSvc: FacturaService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.facturaSvc.misFacturas().subscribe({
      next: r => { this.facturas = r.data ?? []; this.cargando = false; },
      error: () => this.cargando = false
    });
  }

  verDetalle(f: Factura): void {
    this.facturaSeleccionada = this.facturaSeleccionada?.id === f.id ? null : f;
  }

  descargarPdf(f: Factura, event: Event): void {
    event.stopPropagation();
    this.facturaSvc.descargarPdf(f.id);
    this.snack.open('Descargando PDF...', 'OK', { duration: 2000 });
  }

  getEstadoClass(estado: string): string {
    return 'estado-chip estado-' + estado;
  }
}
