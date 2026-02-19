import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: [`
    .form-container { max-width:520px; margin:40px auto; }
    mat-card { padding:32px; }
    h2 { text-align:center; color:#1565C0; margin-bottom:24px; }
    .row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  cargando = false;
  mostrarPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
      direccion: ['']
    });
  }

  register(): void {
    if (this.form.invalid) return;
    this.cargando = true;
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.snack.open('Cuenta creada. Inicia sesión para continuar.', 'OK', {
          duration: 4000, panelClass: 'snack-success'
        });
        this.router.navigate(['/login']);
      },
      error: err => {
        this.snack.open(err.error?.mensaje || 'Error al registrarse', 'OK', {
          duration: 3000, panelClass: 'snack-error'
        });
        this.cargando = false;
      }
    });
  }
}
