import { Component, OnInit } from '@angular/core';
import { FacturaService } from '../../services/factura.service';
import { Factura } from '../../models/factura.model';

@Component({
  selector: 'app-mis-facturas',
  templateUrl: './mis-facturas.component.html',
  styles: [`
    .factura-card { background:white; border-radius:8px; padding:20px; margin-bottom:16px; cursor:pointer; transition:box-shadow .2s; }
    .factura-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); }
    .factura-header { display:flex; justify-content:space-between; align-items:center; }
    .estado-pagada { background:#e8f5e9; color:#2e7d32; padding:4px 12px; border-radius:12px; font-size:.85em; font-weight:600; }
  `]
})
export class MisFacturasComponent implements OnInit {
  facturas: Factura[] = [];
  cargando = true;
  facturaSeleccionada: Factura | null = null;

  constructor(private facturaSvc: FacturaService) {}

  ngOnInit(): void {
    this.facturaSvc.misFacturas().subscribe({
      next: r => { this.facturas = r.data ?? []; this.cargando = false; },
      error: () => this.cargando = false
    });
  }

  verDetalle(f: Factura): void {
    this.facturaSeleccionada = this.facturaSeleccionada?.id === f.id ? null : f;
  }
}
