import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [`
    .form-container { max-width:420px; margin:60px auto; }
    mat-card { padding:32px; }
    h2 { text-align:center; color:#1565C0; margin-bottom:24px; }
  `]
})
export class LoginComponent {
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.form.invalid) return;
    this.cargando = true;
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: err => {
        this.snack.open(err.error?.mensaje || 'Credenciales incorrectas', 'OK', {
          duration: 3000, panelClass: 'snack-error'
        });
        this.cargando = false;
      }
    });
  }
}
