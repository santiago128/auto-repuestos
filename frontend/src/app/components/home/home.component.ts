import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RepuestoService } from '../../services/repuesto.service';
import { Repuesto, Marca, Modelo } from '../../models/repuesto.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [`
    .hero { background: linear-gradient(135deg,#1565C0,#0D47A1); color:white; padding:60px 20px; text-align:center; border-radius:8px; margin-bottom:32px; }
    .hero h1 { font-size:2.5em; margin-bottom:12px; }
    .hero p { font-size:1.1em; opacity:.9; margin-bottom:24px; }
    .featured-section h2 { font-size:1.8em; margin-bottom:20px; color:#1565C0; }
    .marcas-row { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:32px; }
    .marca-btn { border:2px solid #1565C0; border-radius:20px; padding:6px 18px; cursor:pointer; font-weight:500; background:white; color:#1565C0; transition:all .2s; }
    .marca-btn:hover { background:#1565C0; color:white; }
    .vehiculo-search { background:white; padding:24px; border-radius:8px; margin-bottom:32px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
    .vehiculo-search h2 { color:#1565C0; margin-bottom:16px; }
    .vehiculo-row { display:flex; gap:16px; align-items:flex-end; flex-wrap:wrap; }
    .vehiculo-field { min-width:200px; }
  `]
})
export class HomeComponent implements OnInit {
  featuredRepuestos: Repuesto[] = [];
  marcas: Marca[] = [];
  modelosVehiculo: Modelo[] = [];
  marcaSeleccionada: number | null = null;
  modeloSeleccionado: number | null = null;

  constructor(private repuestoSvc: RepuestoService, private router: Router) {}

  ngOnInit(): void {
    this.repuestoSvc.getRepuestos().subscribe(res => {
      const data = res.data;
      if (data && typeof data === 'object' && 'repuestos' in data) {
        this.featuredRepuestos = data.repuestos?.slice(0, 4) ?? [];
      } else {
        this.featuredRepuestos = (Array.isArray(data) ? data : []).slice(0, 4);
      }
    });
    this.repuestoSvc.getMarcas().subscribe(res => {
      this.marcas = res.data ?? [];
    });
  }

  onMarcaVehiculoChange(marcaId: number | null): void {
    this.modeloSeleccionado = null;
    this.modelosVehiculo = [];
    if (marcaId) {
      this.repuestoSvc.getModelos(marcaId).subscribe(r => this.modelosVehiculo = r.data ?? []);
    }
  }

  buscarPorVehiculo(): void {
    if (!this.marcaSeleccionada) return;
    const params: any = { marcaId: this.marcaSeleccionada };
    if (this.modeloSeleccionado) params['modeloId'] = this.modeloSeleccionado;
    this.router.navigate(['/catalogo'], { queryParams: params });
  }

  buscarPorMarca(marcaId: number): void {
    this.router.navigate(['/catalogo'], { queryParams: { marcaId } });
  }

  irACatalogo(): void { this.router.navigate(['/catalogo']); }
}
