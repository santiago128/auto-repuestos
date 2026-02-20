import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styles: [`
    .perfil-container { max-width:600px; margin:0 auto; }
    mat-card { padding:24px; margin-bottom:20px; }
    .form-full-width { width:100%; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    h1 { font-size:1.8em; color:#1565C0; margin-bottom:20px; }
  `]
})
export class PerfilComponent implements OnInit {
  datosForm: FormGroup;
  passwordForm: FormGroup;
  cargandoDatos = false;
  cargandoPassword = false;
  mostrarPasswordActual = false;
  mostrarNuevaPassword = false;

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private snack: MatSnackBar
  ) {
    this.datosForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: [''],
      direccion: ['']
    });

    this.passwordForm = this.fb.group({
      passwordActual: ['', Validators.required],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    this.authSvc.getPerfil().subscribe({
      next: r => {
        const d = r.data;
        this.datosForm.patchValue({
          nombre: d.nombre,
          apellido: d.apellido,
          telefono: d.telefono,
          direccion: d.direccion
        });
      }
    });
  }

  private passwordsMatch(g: FormGroup) {
    const pass = g.get('nuevaPassword')?.value;
    const confirm = g.get('confirmarPassword')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  guardarDatos(): void {
    if (this.datosForm.invalid) return;
    this.cargandoDatos = true;
    this.authSvc.actualizarPerfil(this.datosForm.value).subscribe({
      next: () => {
        this.cargandoDatos = false;
        this.snack.open('Perfil actualizado exitosamente', 'OK', {
          duration: 3000, panelClass: 'snack-success'
        });
      },
      error: err => {
        this.cargandoDatos = false;
        this.snack.open(err.error?.mensaje || 'Error al actualizar', 'OK', {
          duration: 3000, panelClass: 'snack-error'
        });
      }
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) return;
    this.cargandoPassword = true;
    const { passwordActual, nuevaPassword } = this.passwordForm.value;
    this.authSvc.cambiarPassword(passwordActual, nuevaPassword).subscribe({
      next: () => {
        this.cargandoPassword = false;
        this.passwordForm.reset();
        this.snack.open('Contraseña actualizada exitosamente', 'OK', {
          duration: 3000, panelClass: 'snack-success'
        });
      },
      error: err => {
        this.cargandoPassword = false;
        this.snack.open(err.error?.mensaje || 'Error al cambiar contraseña', 'OK', {
          duration: 3000, panelClass: 'snack-error'
        });
      }
    });
  }
}
