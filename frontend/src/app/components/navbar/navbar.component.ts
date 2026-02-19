import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { UsuarioSession } from '../../models/auth.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [`
    .spacer { flex: 1 1 auto; }
    .brand { font-size: 1.2em; font-weight: 700; text-decoration: none; color: white; }
    .nav-user { font-size: 0.9em; margin-right: 8px; }
  `]
})
export class NavbarComponent implements OnInit {
  session: UsuarioSession | null = null;
  totalItems = 0;

  constructor(
    public auth: AuthService,
    public carrito: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.session$.subscribe(s => this.session = s);
    this.carrito.items$.subscribe(() => this.totalItems = this.carrito.totalItems);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
