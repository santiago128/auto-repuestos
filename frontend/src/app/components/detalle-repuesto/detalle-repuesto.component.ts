import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RepuestoService } from '../../services/repuesto.service';
import { CarritoService } from '../../services/carrito.service';
import { FavoritoService } from '../../services/favorito.service';
import { AuthService } from '../../services/auth.service';
import { Repuesto } from '../../models/repuesto.model';

@Component({
  selector: 'app-detalle-repuesto',
  templateUrl: './detalle-repuesto.component.html',
  styles: [`
    .detalle-container { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
    .detalle-img { width:100%; max-height:400px; object-fit:contain; border-radius:8px; background:white; padding:16px; }
    .precio-grande { font-size:2em; font-weight:700; color:#1565C0; margin:16px 0; }
    .info-row { margin:8px 0; }
    .relacionados-grid { display:flex; gap:16px; flex-wrap:wrap; margin-top:16px; }
    .relacionado-card { width:220px; cursor:pointer; }
    @media(max-width:600px){.detalle-container{grid-template-columns:1fr}}
  `]
})
export class DetalleRepuestoComponent implements OnInit {
  repuesto: Repuesto | null = null;
  relacionados: Repuesto[] = [];
  cantidad = 1;
  cargando = true;
  esFavorito = false;
  logueado = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private repuestoSvc: RepuestoService,
    private carritoSvc: CarritoService,
    private favoritoSvc: FavoritoService,
    private authSvc: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.logueado = this.authSvc.isLoggedIn();
    const id = +this.route.snapshot.paramMap.get('id')!;

    this.repuestoSvc.getRepuesto(id).subscribe({
      next: r => {
        this.repuesto = r.data;
        this.cargando = false;
        this.esFavorito = this.favoritoSvc.esFavorito(id);
        this.cargarRelacionados(id);
      },
      error: () => { this.router.navigate(['/catalogo']); }
    });

    this.favoritoSvc.getFavoritosIds$().subscribe(ids => {
      if (this.repuesto) this.esFavorito = ids.has(this.repuesto.id);
    });
  }

  private cargarRelacionados(id: number): void {
    this.repuestoSvc.getRelacionados(id).subscribe({
      next: r => this.relacionados = r.data ?? [],
      error: () => {}
    });
  }

  agregarAlCarrito(): void {
    if (!this.repuesto) return;
    this.carritoSvc.agregar(this.repuesto, this.cantidad);
    this.snack.open('Producto agregado al carrito', 'Ver carrito', {
      duration: 3000, panelClass: 'snack-success'
    }).onAction().subscribe(() => this.router.navigate(['/carrito']));
  }

  toggleFavorito(): void {
    if (!this.logueado) {
      this.snack.open('Inicia sesión para guardar favoritos', 'OK', { duration: 2500 });
      return;
    }
    if (!this.repuesto) return;
    this.favoritoSvc.toggleFavorito(this.repuesto.id).subscribe({
      next: r => {
        const accion = r.data?.accion;
        this.esFavorito = accion === 'AGREGADO';
        this.snack.open(
          this.esFavorito ? 'Agregado a favoritos' : 'Eliminado de favoritos',
          'OK', { duration: 2000 }
        );
      }
    });
  }
}
