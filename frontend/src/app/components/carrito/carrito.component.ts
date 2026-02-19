import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { CarritoItem } from '../../models/repuesto.model';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styles: [`
    .carrito-tabla { width:100%; }
    .total-row { font-size:1.3em; font-weight:600; color:#1565C0; }
    .carrito-resumen { background:white; padding:20px; border-radius:8px; max-width:400px; margin-left:auto; }
    .empty-cart { text-align:center; padding:60px; color:#888; }
  `]
})
export class CarritoComponent {
  displayedColumns = ['producto', 'precio', 'cantidad', 'subtotal', 'acciones'];

  constructor(public carrito: CarritoService, private router: Router) {}

  actualizarCantidad(item: CarritoItem, delta: number): void {
    const nueva = item.cantidad + delta;
    if (nueva <= 0) {
      this.carrito.eliminar(item.repuesto.id);
    } else {
      this.carrito.actualizar(item.repuesto.id, Math.min(nueva, item.repuesto.stock));
    }
  }

  eliminar(item: CarritoItem): void {
    this.carrito.eliminar(item.repuesto.id);
  }

  irAlCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
