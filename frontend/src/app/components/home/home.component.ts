import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RepuestoService } from '../../services/repuesto.service';
import { Repuesto, Marca } from '../../models/repuesto.model';

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
  `]
})
export class HomeComponent implements OnInit {
  featuredRepuestos: Repuesto[] = [];
  marcas: Marca[] = [];

  constructor(private repuestoSvc: RepuestoService, private router: Router) {}

  ngOnInit(): void {
    this.repuestoSvc.getRepuestos().subscribe(res => {
      this.featuredRepuestos = res.data?.slice(0, 4) ?? [];
    });
    this.repuestoSvc.getMarcas().subscribe(res => {
      this.marcas = res.data ?? [];
    });
  }

  buscarPorMarca(marcaId: number): void {
    this.router.navigate(['/catalogo'], { queryParams: { marcaId } });
  }

  irACatalogo(): void { this.router.navigate(['/catalogo']); }
}
