import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FavoritoService } from '../../services/favorito.service';
import { CarritoService } from '../../services/carrito.service';
import { Repuesto } from '../../models/repuesto.model';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styles: [`
    h1 { font-size:2em; color:#1565C0; margin-bottom:20px; }
    .no-results { text-align:center; padding:60px; color:#888; }
  `]
})
export class FavoritosComponent implements OnInit {
  repuestos: Repuesto[] = [];
  cargando = true;

  constructor(
    private favoritoSvc: FavoritoService,
    private carritoSvc: CarritoService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.favoritoSvc.getFavoritos().subscribe({
      next: r => { this.repuestos = r.data ?? []; this.cargando = false; },
      error: () => this.cargando = false
    });
  }

  toggleFavorito(repuesto: Repuesto, event: Event): void {
    event.stopPropagation();
    this.favoritoSvc.toggleFavorito(repuesto.id).subscribe({
      next: r => {
        if (r.data?.accion === 'ELIMINADO') {
          this.repuestos = this.repuestos.filter(r => r.id !== repuesto.id);
          this.snack.open(`"${repuesto.nombre}" eliminado de favoritos`, 'OK', { duration: 2000 });
        }
      }
    });
  }

  agregarAlCarrito(repuesto: Repuesto, event: Event): void {
    event.stopPropagation();
    if (repuesto.stock === 0) return;
    this.carritoSvc.agregar(repuesto, 1);
    this.snack.open(`"${repuesto.nombre}" agregado al carrito`, 'OK', { duration: 2000, panelClass: 'snack-success' });
  }
}
