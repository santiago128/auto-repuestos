import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarritoService } from '../../services/carrito.service';
import { FacturaService } from '../../services/factura.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styles: [`
    .checkout-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
    @media(max-width:700px){.checkout-grid{grid-template-columns:1fr}}
    .resumen-card { background:white; border-radius:8px; padding:20px; }
    .procesando { text-align:center; padding:40px; }
  `]
})
export class CheckoutComponent {
  form: FormGroup;
  procesando = false;
  facturaCreada: any = null;

  constructor(
    private fb: FormBuilder,
    private carritoSvc: CarritoService,
    private facturaSvc: FacturaService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      direccionEnvio: ['', Validators.required],
      observaciones: ['']
    });
  }

  get items() { return this.carritoSvc.items; }
  get subtotal() { return this.carritoSvc.subtotal; }
  get iva() { return this.carritoSvc.iva; }
  get total() { return this.carritoSvc.total; }

  confirmarPedido(): void {
    if (this.form.invalid) return;
    this.procesando = true;

    const req = {
      items: this.items.map(i => ({ repuestoId: i.repuesto.id, cantidad: i.cantidad })),
      direccionEnvio: this.form.value.direccionEnvio,
      observaciones: this.form.value.observaciones
    };

    this.facturaSvc.crearFactura(req).subscribe({
      next: res => {
        this.facturaCreada = res.data;
        this.carritoSvc.vaciar();
        this.procesando = false;
      },
      error: err => {
        this.snack.open(err.error?.mensaje || 'Error al procesar el pedido', 'OK', {
          duration: 4000, panelClass: 'snack-error'
        });
        this.procesando = false;
      }
    });
  }
}
