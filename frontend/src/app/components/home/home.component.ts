import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RepuestoService } from '../../services/repuesto.service';
import { FavoritoService } from '../../services/favorito.service';
import { AuthService } from '../../services/auth.service';
import { Repuesto, Marca, Modelo } from '../../models/repuesto.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [`
    /* ── Hero ── */
    .hero {
      background: linear-gradient(135deg, #0f1c3e 0%, #1a2f5e 45%, #1e40af 100%);
      color: white;
      padding: 72px 48px;
      border-radius: 24px;
      margin-bottom: 36px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -60%; right: -15%;
      width: 520px; height: 520px;
      background: radial-gradient(circle, rgba(245,158,11,.14) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content { position: relative; }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(245,158,11,.18);
      color: #fcd34d;
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 9999px;
      border: 1px solid rgba(245,158,11,.3);
      margin-bottom: 18px;
      animation: slideInL .5s ease;
    }
    .hero h1 {
      font-size: 2.6rem;
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: -.03em;
      line-height: 1.15;
      animation: slideInL .55s ease;
    }
    .hero p {
      font-size: 1.1rem;
      opacity: .85;
      margin-bottom: 32px;
      max-width: 500px;
      line-height: 1.65;
      animation: slideInL .6s ease;
    }
    .hero-ctas { animation: slideUp .7s ease; }
    .hero-stats {
      display: flex;
      gap: 32px;
      margin-top: 40px;
      padding-top: 28px;
      border-top: 1px solid rgba(255,255,255,.15);
      flex-wrap: wrap;
      animation: slideUp .75s ease;
    }
    .stat { display: flex; flex-direction: column; }
    .stat-value {
      font-size: 1.7rem;
      font-weight: 800;
      color: #fcd34d;
      letter-spacing: -.02em;
      line-height: 1;
    }
    .stat-label {
      font-size: .78rem;
      font-weight: 500;
      color: rgba(255,255,255,.6);
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    @keyframes slideInL { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

    /* ── Vehicle Search ── */
    .vehiculo-search {
      background: white;
      padding: 28px;
      border-radius: 16px;
      margin-bottom: 36px;
      box-shadow: 0 4px 16px rgba(0,0,0,.07);
      border: 1px solid #e2e8f0;
      animation: slideUp .5s ease;
    }
    .vehiculo-search h2 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #1a2f5e;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .vehiculo-row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
    .vehiculo-field { flex: 1; min-width: 200px; }

    /* ── Featured sections ── */
    .featured-section { margin-bottom: 44px; }
    .featured-section h2 {
      font-size: 1.45rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 3px solid #f59e0b;
      display: inline-block;
    }

    /* ── Brand buttons ── */
    .marcas-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; }
    .marca-btn {
      background: white;
      color: #1a2f5e;
      border: 2px solid #1a2f5e;
      border-radius: 9999px;
      padding: 7px 20px;
      font-size: .88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all .25s cubic-bezier(.4,0,.2,1);
      font-family: 'Inter','Roboto',sans-serif;
    }
    .marca-btn:hover {
      background: #1a2f5e;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(26,47,94,.25);
    }

    @media (max-width:768px) {
      .hero { padding: 48px 24px; }
      .hero h1 { font-size: 1.9rem; }
      .hero-stats { gap: 20px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredRepuestos: Repuesto[] = [];
  marcas: Marca[] = [];
  modelosVehiculo: Modelo[] = [];
  marcaSeleccionada: number | null = null;
  modeloSeleccionado: number | null = null;
  favoritosIds = new Set<number>();
  logueado = false;

  constructor(
    private repuestoSvc: RepuestoService,
    private router: Router,
    private favoritoSvc: FavoritoService,
    private authSvc: AuthService,
    private snack: MatSnackBar
  ) {}

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

    this.logueado = this.authSvc.isLoggedIn();
    this.authSvc.session$.subscribe(s => { this.logueado = !!s; });
    this.favoritoSvc.getFavoritosIds$().subscribe(ids => this.favoritosIds = ids);
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

  toggleFavorito(repuesto: Repuesto, event: Event): void {
    event.stopPropagation();
    if (!this.logueado) {
      this.snack.open('Inicia sesión para guardar favoritos', 'OK', { duration: 2500 });
      return;
    }
    this.favoritoSvc.toggleFavorito(repuesto.id).subscribe({
      next: r => {
        const accion = r.data?.accion;
        // Actualizar Set local para que el ícono cambie inmediatamente
        const updated = new Set(this.favoritosIds);
        if (accion === 'AGREGADO') {
          updated.add(repuesto.id);
        } else {
          updated.delete(repuesto.id);
        }
        this.favoritosIds = updated;
        this.snack.open(
          accion === 'AGREGADO' ? 'Agregado a favoritos' : 'Eliminado de favoritos',
          'OK', { duration: 2000 }
        );
      },
      error: () => {
        this.snack.open('Error al actualizar favoritos. Intenta de nuevo.', 'OK', {
          duration: 3000, panelClass: 'snack-error'
        });
      }
    });
  }

  esFavorito(id: number): boolean {
    return this.favoritosIds.has(id);
  }
}
