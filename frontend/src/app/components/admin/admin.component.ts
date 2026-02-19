import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RepuestoService } from '../../services/repuesto.service';
import { Repuesto, Marca, Modelo, Categoria } from '../../models/repuesto.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styles: [`
    .admin-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    mat-tab-group { background:white; border-radius:8px; }
    .tab-content { padding:20px; }
    .tabla-repuestos { width:100%; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
    .upload-area { display:flex; align-items:center; gap:16px; margin:8px 0 16px; }
    .img-preview { width:80px; height:80px; object-fit:cover; border-radius:8px; border:1px solid #ddd; }
    .img-placeholder { width:80px; height:80px; display:flex; align-items:center; justify-content:center; background:#f5f5f5; border-radius:8px; border:1px dashed #ccc; color:#aaa; }
    .thumb-tabla { width:40px; height:40px; object-fit:cover; border-radius:4px; }
  `]
})
export class AdminComponent implements OnInit {
  repuestos: Repuesto[] = [];
  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  categorias: Categoria[] = [];

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

  constructor(
    private fb: FormBuilder,
    private repuestoSvc: RepuestoService,
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
  }

  cargarDatos(): void {
    this.repuestoSvc.getRepuestos().subscribe(r => this.repuestos = r.data ?? []);
    this.repuestoSvc.getMarcas().subscribe(r => this.marcas = r.data ?? []);
    this.repuestoSvc.getCategorias().subscribe(r => this.categorias = r.data ?? []);
  }

  onMarcaChange(marcaId: number): void {
    this.repuestoSvc.getModelos(marcaId).subscribe(r => this.modelos = r.data ?? []);
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
    // Vista previa local
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
