import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RepuestoService } from '../../services/repuesto.service';
import { FacturaService } from '../../services/factura.service';
import { Repuesto, Marca, Modelo, Categoria } from '../../models/repuesto.model';
import { Factura } from '../../models/factura.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styles: [`
    .admin-page-title {
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -.03em;
      margin-bottom: 24px;
    }
    .admin-page-title::after {
      content: '';
      display: block;
      width: 40px; height: 4px;
      background: #f59e0b;
      border-radius: 2px;
      margin-top: 6px;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    mat-tab-group {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,.07);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .tab-content { padding: 24px; }
    .tabla-repuestos { width: 100%; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
    .upload-area {
      display: flex;
      align-items: center;
      gap: 18px;
      margin: 10px 0 18px;
      padding: 14px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px dashed #cbd5e1;
    }
    .img-preview {
      width: 88px; height: 88px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 6px rgba(0,0,0,.08);
    }
    .img-placeholder {
      width: 88px; height: 88px;
      display: flex; align-items: center; justify-content: center;
      background: #f1f5f9;
      border-radius: 10px;
      border: 2px dashed #cbd5e1;
      color: #94a3b8;
    }
    .thumb-tabla {
      width: 44px; height: 44px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    .estado-PAGADA     { color: #1d4ed8; font-weight: 600; }
    .estado-EN_PROCESO { color: #b45309; font-weight: 600; }
    .estado-ENVIADO    { color: #7c3aed; font-weight: 600; }
    .estado-ENTREGADO  { color: #065f46; font-weight: 600; }
    .estado-CANCELADO  { color: #991b1b; font-weight: 600; }
  `]
})
export class AdminComponent implements OnInit {
  repuestos: Repuesto[] = [];
  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  categorias: Categoria[] = [];
  facturas: Factura[] = [];

  // Repuesto form
  repuestoForm: FormGroup;
  repuestoEditando: Repuesto | null = null;
  mostrarFormRepuesto = false;

  // Upload imagen
  imagenPreview: string | null = null;
  uploadingImagen = false;
  archivoSeleccionado: File | null = null;

  // Marca form
  marcaForm: FormGroup;
  mostrarFormMarca = false;

  // Modelo form
  modeloForm: FormGroup;
  mostrarFormModelo = false;

  columnas = ['imagen', 'codigo', 'nombre', 'marca', 'modelo', 'precio', 'stock', 'acciones'];
  columnasFacturas = ['numero', 'cliente', 'fecha', 'total', 'estado', 'acciones'];

  estadosPosibles = ['PAGADA', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

  constructor(
    private fb: FormBuilder,
    private repuestoSvc: RepuestoService,
    private facturaSvc: FacturaService,
    private snack: MatSnackBar
  ) {
    this.repuestoForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      marcaId: [null, Validators.required],
      modeloId: [null],
      categoriaId: [null],
      imagenUrl: ['']
    });

    this.marcaForm = this.fb.group({
      nombre: ['', Validators.required],
      paisOrigen: ['']
    });

    this.modeloForm = this.fb.group({
      nombre: ['', Validators.required],
      anioInicio: [null],
      anioFin: [null],
      marcaId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarFacturas();
  }

  cargarDatos(): void {
    this.repuestoSvc.getRepuestos().subscribe(r => {
      const data = r.data;
      this.repuestos = (data && typeof data === 'object' && 'repuestos' in data)
        ? data.repuestos ?? []
        : (Array.isArray(data) ? data : []);
    });
    this.repuestoSvc.getMarcas().subscribe(r => this.marcas = r.data ?? []);
    this.repuestoSvc.getCategorias().subscribe(r => this.categorias = r.data ?? []);
  }

  cargarFacturas(): void {
    this.facturaSvc.todasLasFacturas().subscribe({
      next: r => this.facturas = r.data ?? [],
      error: () => {}
    });
  }

  onMarcaChange(marcaId: number): void {
    this.repuestoSvc.getModelos(marcaId).subscribe(r => this.modelos = r.data ?? []);
  }

  cambiarEstadoFactura(factura: Factura, nuevoEstado: string): void {
    this.facturaSvc.cambiarEstado(factura.id, nuevoEstado).subscribe({
      next: () => {
        factura.estado = nuevoEstado;
        this.snack.open('Estado actualizado', 'OK', { duration: 2000, panelClass: 'snack-success' });
      },
      error: err => this.snack.open(err.error?.mensaje || 'Error al cambiar estado', 'OK', {
        duration: 3000, panelClass: 'snack-error'
      })
    });
  }

  descargarPdf(facturaId: number): void {
    this.facturaSvc.descargarPdf(facturaId);
  }

  // --- REPUESTOS ---
  editarRepuesto(r: Repuesto): void {
    this.repuestoEditando = r;
    this.repuestoForm.patchValue({
      codigo: r.codigo,
      nombre: r.nombre,
      descripcion: r.descripcion,
      precio: r.precio,
      stock: r.stock,
      marcaId: r.marca?.id,
      modeloId: r.modelo?.id,
      categoriaId: r.categoria?.id,
      imagenUrl: r.imagenUrl
    });
    this.imagenPreview = r.imagenUrl || null;
    this.archivoSeleccionado = null;
    if (r.marca?.id) this.onMarcaChange(r.marca.id);
    this.mostrarFormRepuesto = true;
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.archivoSeleccionado = file;
    const reader = new FileReader();
    reader.onload = () => this.imagenPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  guardarRepuesto(): void {
    if (this.repuestoForm.invalid) return;

    if (this.archivoSeleccionado) {
      this.uploadingImagen = true;
      this.repuestoSvc.uploadImagen(this.archivoSeleccionado).subscribe({
        next: res => {
          this.repuestoForm.patchValue({ imagenUrl: res.url });
          this.uploadingImagen = false;
          this.archivoSeleccionado = null;
          this._guardarRepuestoData();
        },
        error: err => {
          this.uploadingImagen = false;
          this.snack.open(err.error?.mensaje || 'Error al subir la imagen', 'OK', { duration: 3000, panelClass: 'snack-error' });
        }
      });
    } else {
      this._guardarRepuestoData();
    }
  }

  private _guardarRepuestoData(): void {
    const data = this.repuestoForm.value;
    const obs = this.repuestoEditando
      ? this.repuestoSvc.actualizarRepuesto(this.repuestoEditando.id, data)
      : this.repuestoSvc.crearRepuesto(data);

    obs.subscribe({
      next: r => {
        this.snack.open(r.mensaje || 'Guardado exitosamente', 'OK', { duration: 2500, panelClass: 'snack-success' });
        this.cancelarFormRepuesto();
        this.cargarDatos();
      },
      error: err => this.snack.open(err.error?.mensaje || 'Error al guardar', 'OK', { duration: 3000, panelClass: 'snack-error' })
    });
  }

  eliminarRepuesto(r: Repuesto): void {
    if (!confirm(`¿Eliminar "${r.nombre}"?`)) return;
    this.repuestoSvc.eliminarRepuesto(r.id).subscribe({
      next: () => { this.snack.open('Repuesto eliminado', 'OK', { duration: 2000 }); this.cargarDatos(); },
      error: err => this.snack.open(err.error?.mensaje || 'Error', 'OK', { duration: 3000, panelClass: 'snack-error' })
    });
  }

  cancelarFormRepuesto(): void {
    this.repuestoEditando = null;
    this.repuestoForm.reset({ stock: 0 });
    this.mostrarFormRepuesto = false;
    this.imagenPreview = null;
    this.archivoSeleccionado = null;
  }

  // --- MARCAS ---
  guardarMarca(): void {
    if (this.marcaForm.invalid) return;
    this.repuestoSvc.crearMarca(this.marcaForm.value).subscribe({
      next: r => {
        this.snack.open(r.mensaje || 'Marca guardada', 'OK', { duration: 2500, panelClass: 'snack-success' });
        this.marcaForm.reset();
        this.mostrarFormMarca = false;
        this.cargarDatos();
      },
      error: err => this.snack.open(err.error?.mensaje || 'Error', 'OK', { duration: 3000, panelClass: 'snack-error' })
    });
  }

  // --- MODELOS ---
  guardarModelo(): void {
    if (this.modeloForm.invalid) return;
    this.repuestoSvc.crearModelo(this.modeloForm.value).subscribe({
      next: r => {
        this.snack.open(r.mensaje || 'Modelo guardado', 'OK', { duration: 2500, panelClass: 'snack-success' });
        this.modeloForm.reset();
        this.mostrarFormModelo = false;
        this.cargarDatos();
      },
      error: err => this.snack.open(err.error?.mensaje || 'Error', 'OK', { duration: 3000, panelClass: 'snack-error' })
    });
  }
}
