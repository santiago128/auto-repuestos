import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styles: [`
    .form-container { max-width:400px; margin:60px auto; padding:16px; }
    mat-card { padding:32px; }
    .form-full-width { width:100%; }
  `]
})
export class ForgotPasswordComponent {
  form: FormGroup;
  cargando = false;
  enviado = false;

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  enviar(): void {
    if (this.form.invalid) return;
    this.cargando = true;
    this.authSvc.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.cargando = false;
        this.enviado = true;
      },
      error: err => {
        this.cargando = false;
        this.snack.open(err.error?.mensaje || 'Error al enviar el correo', 'OK', {
          duration: 4000, panelClass: 'snack-error'
        });
      }
    });
  }
}
