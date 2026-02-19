import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RepuestoService } from '../../services/repuesto.service';
import { CarritoService } from '../../services/carrito.service';
import { Repuesto, Marca, Modelo, Categoria } from '../../models/repuesto.model';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styles: [`
    .filtros { background:white; padding:16px; border-radius:8px; margin-bottom:20px; display:flex; gap:16px; flex-wrap:wrap; align-items:center; }
    .filtro-field { min-width:180px; }
    h1 { font-size:2em; color:#1565C0; margin-bottom:8px; }
    .no-results { text-align:center; padding:40px; color:#888; }
  `]
})
export class CatalogoComponent implements OnInit {
  repuestos: Repuesto[] = [];
  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  categorias: Categoria[] = [];
  filtroForm: FormGroup;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private repuestoSvc: RepuestoService,
    private carritoSvc: CarritoService,
    private snack: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.filtroForm = this.fb.group({
      nombre: [''],
      marcaId: [null],
      modeloId: [null],
      categoriaId: [null]
    });
  }

  ngOnInit(): void {
    this.repuestoSvc.getMarcas().subscribe(r => this.marcas = r.data ?? []);
    this.repuestoSvc.getCategorias().subscribe(r => this.categorias = r.data ?? []);

    this.route.queryParams.subscribe(params => {
      if (params['marcaId']) {
        this.filtroForm.patchValue({ marcaId: +params['marcaId'] });
        this.onMarcaChange(+params['marcaId']);
      }
      this.buscar();
    });

    this.filtroForm.get('marcaId')?.valueChanges.subscribe(val => {
      this.filtroForm.patchValue({ modeloId: null }, { emitEvent: false });
      if (val) this.onMarcaChange(val);
      else this.modelos = [];
    });
  }

  onMarcaChange(marcaId: number): void {
    this.repuestoSvc.getModelos(marcaId).subscribe(r => this.modelos = r.data ?? []);
  }

  buscar(): void {
    this.cargando = true;
    const f = this.filtroForm.value;
    this.repuestoSvc.getRepuestos({
      nombre: f.nombre || undefined,
      marcaId: f.marcaId || undefined,
      modeloId: f.modeloId || undefined,
      categoriaId: f.categoriaId || undefined
    }).subscribe({
      next: r => { this.repuestos = r.data ?? []; this.cargando = false; },
      error: () => this.cargando = false
    });
  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.modelos = [];
    this.buscar();
  }

  agregarAlCarrito(repuesto: Repuesto): void {
    if (repuesto.stock === 0) return;
    this.carritoSvc.agregar(repuesto, 1);
    this.snack.open(`"${repuesto.nombre}" agregado al carrito`, 'OK', {
      duration: 2000, panelClass: 'snack-success'
    });
  }
}
