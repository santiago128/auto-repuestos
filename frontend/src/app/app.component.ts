import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-wrapper">
      <app-navbar></app-navbar>
      <main class="container page-content">
        <router-outlet></router-outlet>
      </main>
      <footer class="site-footer">
        <div class="footer-inner container">
          <div class="footer-brand">
            <mat-icon>directions_car</mat-icon>
            <div>
              <strong class="footer-name">AutoRepuestos</strong>
              <span class="footer-tagline">Tu tienda de repuestos para vehículos de confianza</span>
            </div>
          </div>
          <div class="footer-links">
            <a routerLink="/catalogo" class="footer-link">Catálogo</a>
            <a routerLink="/mis-facturas" class="footer-link">Mis Pedidos</a>
            <a routerLink="/perfil" class="footer-link">Mi Perfil</a>
          </div>
          <a class="footer-whatsapp"
             href="https://wa.me/593XXXXXXXXX"
             target="_blank"
             rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
        <div class="footer-bottom container">
          <p>&copy; {{ year }} AutoRepuestos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main { flex: 1; }

    /* ── Footer ── */
    .site-footer {
      background: linear-gradient(135deg, #0a1628 0%, #1a2f5e 100%);
      color: rgba(255,255,255,.88);
      padding: 36px 0 0;
      margin-top: 60px;
    }
    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 24px;
      padding-bottom: 28px;
      border-bottom: 1px solid rgba(255,255,255,.10);
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      mat-icon { font-size: 2rem; width: 2rem; height: 2rem; opacity: .85; }
    }
    .footer-name {
      display: block;
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -.01em;
    }
    .footer-tagline {
      display: block;
      font-size: .8rem;
      color: rgba(255,255,255,.55);
      margin-top: 2px;
    }
    .footer-links {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .footer-link {
      color: rgba(255,255,255,.65);
      text-decoration: none;
      font-size: .88rem;
      font-weight: 500;
      transition: color .2s;
      &:hover { color: #f59e0b; }
    }
    .footer-whatsapp {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #25d366;
      color: #fff;
      text-decoration: none;
      padding: 9px 20px;
      border-radius: 9999px;
      font-size: .88rem;
      font-weight: 600;
      transition: background .2s, transform .2s;
      &:hover { background: #1db954; transform: translateY(-2px); }
    }
    .footer-bottom {
      padding: 14px 24px;
      text-align: center;
      font-size: .76rem;
      color: rgba(255,255,255,.35);
    }
  `]
})
export class AppComponent {
  year = new Date().getFullYear();
}
