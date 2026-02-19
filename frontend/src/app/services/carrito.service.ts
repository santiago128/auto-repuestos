import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CarritoItem, Repuesto } from '../models/repuesto.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly STORAGE_KEY = 'repuestos_carrito';
  private itemsSubject = new BehaviorSubject<CarritoItem[]>(this.loadCarrito());

  items$ = this.itemsSubject.asObservable();

  get items(): CarritoItem[] { return this.itemsSubject.value; }

  get totalItems(): number {
    return this.items.reduce((sum, i) => sum + i.cantidad, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, i) => sum + (i.repuesto.precio * i.cantidad), 0);
  }

  get iva(): number { return this.subtotal * 0.12; }
  get total(): number { return this.subtotal + this.iva; }

  agregar(repuesto: Repuesto, cantidad: number = 1): void {
    const items = [...this.items];
    const idx = items.findIndex(i => i.repuesto.id === repuesto.id);
    if (idx >= 0) {
      const nuevaCantidad = items[idx].cantidad + cantidad;
      items[idx] = { ...items[idx], cantidad: Math.min(nuevaCantidad, repuesto.stock) };
    } else {
      items.push({ repuesto, cantidad: Math.min(cantidad, repuesto.stock) });
    }
    this.save(items);
  }

  actualizar(repuestoId: number, cantidad: number): void {
    if (cantidad <= 0) { this.eliminar(repuestoId); return; }
    const items = this.items.map(i =>
      i.repuesto.id === repuestoId ? { ...i, cantidad } : i
    );
    this.save(items);
  }

  eliminar(repuestoId: number): void {
    this.save(this.items.filter(i => i.repuesto.id !== repuestoId));
  }

  vaciar(): void { this.save([]); }

  private save(items: CarritoItem[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  private loadCarrito(): CarritoItem[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}
