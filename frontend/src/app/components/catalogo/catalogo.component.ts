import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RepuestoService } from '../../services/repuesto.service';
import { CarritoService } from '../../services/carrito.service';
import { FavoritoService } from '../../services/favorito.service';
import { AuthService } from '../../services/auth.service';
import { Repuesto, Marca, Modelo, Categoria } from '../../models/repuesto.model';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styles: [`
    .filtros { background:white; padding:16px; border-radius:8px; margin-bottom:20px; display:flex; gap:16px; flex-wrap:wrap; align-items:center; }
    .filtro-field { min-width:180px; }
    h1 { font-size:2em; color:#1565C0; margin-bottom:8px; }
    .no-results { text-align:center; padding:40px; color:#888; }
    .paginator-container { display:flex; justify-content:center; margin-top:20px; }
    .fav-btn { position:absolute; top:8px; right:8px; }
    .producto-card { position:relative; }
  `]
})
export class CatalogoComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  repuestos: Repuesto[] = [];
  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  categorias: Categoria[] = [];
  filtroForm: FormGroup;
  cargando = false;
  totalItems = 0;
  pageSize = 12;
  pageIndex = 0;
  favoritosIds = new Set<number>();
  logueado = false;

  constructor(
    private fb: FormBuilder,
    private repuestoSvc: RepuestoService,
    private carritoSvc: CarritoService,
    private favoritoSvc: FavoritoService,
    private authSvc: AuthService,
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

    this.logueado = this.authSvc.isLoggedIn();
    this.authSvc.session$.subscribe(s => {
      this.logueado = !!s;
    });

    this.favoritoSvc.getFavoritosIds$().subscribe(ids => this.favoritosIds = ids);

    this.route.queryParams.subscribe(params => {
      if (params['marcaId']) {
        this.filtroForm.patchValue({ marcaId: +params['marcaId'] });
        this.onMarcaChange(+params['marcaId']);
      }
      if (params['modeloId']) {
        this.filtroForm.patchValue({ modeloId: +params['modeloId'] });
      }
      this.pageIndex = 0;
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
      categoriaId: f.categoriaId || undefined,
      page: this.pageIndex,
      size: this.pageSize
    }).subscribe({
      next: r => {
        const data = r.data;
        if (data && typeof data === 'object' && 'repuestos' in data) {
          this.repuestos = data.repuestos ?? [];
          this.totalItems = data.total ?? 0;
        } else {
          this.repuestos = Array.isArray(data) ? data : [];
          this.totalItems = this.repuestos.length;
        }
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buscar();
    window.scrollTo(0, 0);
  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.modelos = [];
    this.pageIndex = 0;
    this.buscar();
  }

  agregarAlCarrito(repuesto: Repuesto): void {
    if (repuesto.stock === 0) return;
    this.carritoSvc.agregar(repuesto, 1);
    this.snack.open(`"${repuesto.nombre}" agregado al carrito`, 'OK', {
      duration: 2000, panelClass: 'snack-success'
    });
  }

  toggleFavorito(repuesto: Repuesto, event: Event): void {
    event.stopPropagation();
    if (!this.logueado) {
      this.snack.open('Inicia sesión para guardar favoritos', 'OK', { duration: 2500 });
      return;
    }
    this.favoritoSvc.toggleFavorito(repuesto.id).subscribe({
      next: r => {
        const accion = r.data?.accion;
        this.snack.open(
          accion === 'AGREGADO' ? 'Agregado a favoritos' : 'Eliminado de favoritos',
          'OK', { duration: 2000 }
        );
      }
    });
  }

  esFavorito(id: number): boolean {
    return this.favoritosIds.has(id);
  }
}
