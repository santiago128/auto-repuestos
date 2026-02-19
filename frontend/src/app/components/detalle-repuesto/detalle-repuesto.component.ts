import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RepuestoService } from '../../services/repuesto.service';
import { CarritoService } from '../../services/carrito.service';
import { Repuesto } from '../../models/repuesto.model';

@Component({
  selector: 'app-detalle-repuesto',
  templateUrl: './detalle-repuesto.component.html',
  styles: [`
    .detalle-container { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
    .detalle-img { width:100%; max-height:400px; object-fit:contain; border-radius:8px; background:white; padding:16px; }
    .precio-grande { font-size:2em; font-weight:700; color:#1565C0; margin:16px 0; }
    .info-row { margin:8px 0; }
    @media(max-width:600px){.detalle-container{grid-template-columns:1fr}}
  `]
})
export class DetalleRepuestoComponent implements OnInit {
  repuesto: Repuesto | null = null;
  cantidad = 1;
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private repuestoSvc: RepuestoService,
    private carritoSvc: CarritoService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.repuestoSvc.getRepuesto(id).subscribe({
      next: r => { this.repuesto = r.data; this.cargando = false; },
      error: () => { this.router.navigate(['/catalogo']); }
    });
  }

  agregarAlCarrito(): void {
    if (!this.repuesto) return;
    this.carritoSvc.agregar(this.repuesto, this.cantidad);
    this.snack.open('Producto agregado al carrito', 'Ver carrito', {
      duration: 3000, panelClass: 'snack-success'
    }).onAction().subscribe(() => this.router.navigate(['/carrito']));
  }
}
