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
    .catalog-header {
      margin-bottom: 24px;
      animation: slideInL .4s ease;
    }
    .catalog-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -.03em;
    }
    .catalog-header h1::after {
      content: '';
      display: block;
      width: 40px; height: 4px;
      background: #f59e0b;
      border-radius: 2px;
      margin-top: 6px;
    }
    .filtros {
      background: white;
      padding: 18px 22px;
      border-radius: 14px;
      margin-bottom: 24px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
      border: 1px solid #e2e8f0;
      animation: slideUp .45s ease;
    }
    .filtro-field { flex: 1; min-width: 180px; }
    @keyframes slideInL { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
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
