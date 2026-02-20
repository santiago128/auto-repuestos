import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styles: [`
    .form-container { max-width:400px; margin:60px auto; padding:16px; }
    mat-card { padding:32px; }
    .form-full-width { width:100%; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  cargando = false;
  token = '';
  tokenInvalido = false;
  exitoso = false;
  mostrarPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authSvc: AuthService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.tokenInvalido = true;
    }
  }

  private passwordsMatch(g: FormGroup) {
    const pass = g.get('nuevaPassword')?.value;
    const confirm = g.get('confirmarPassword')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  restablecer(): void {
    if (this.form.invalid || !this.token) return;
    this.cargando = true;
    this.authSvc.resetPassword(this.token, this.form.value.nuevaPassword).subscribe({
      next: () => {
        this.cargando = false;
        this.exitoso = true;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: err => {
        this.cargando = false;
        this.snack.open(err.error?.mensaje || 'Error al restablecer la contraseña', 'OK', {
          duration: 4000, panelClass: 'snack-error'
        });
      }
    });
  }
}
