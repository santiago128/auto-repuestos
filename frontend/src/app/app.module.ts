import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Componentes
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { DetalleRepuestoComponent } from './components/detalle-repuesto/detalle-repuesto.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MisFacturasComponent } from './components/mis-facturas/mis-facturas.component';
import { AdminComponent } from './components/admin/admin.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    CatalogoComponent,
    DetalleRepuestoComponent,
    CarritoComponent,
    CheckoutComponent,
    LoginComponent,
    RegisterComponent,
    MisFacturasComponent,
    AdminComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule,
    MatBadgeModule, MatTableModule, MatDialogModule, MatChipsModule,
    MatProgressSpinnerModule, MatTabsModule, MatDividerModule, MatTooltipModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
