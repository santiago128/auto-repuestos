import { Repuesto } from './repuesto.model';

export interface DetalleFactura {
  id: number;
  repuesto: Repuesto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Factura {
  id: number;
  numeroFactura: string;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: string;
  direccionEnvio?: string;
  observaciones?: string;
  detalles: DetalleFactura[];
}

export interface FacturaRequest {
  items: { repuestoId: number; cantidad: number }[];
  direccionEnvio?: string;
  observaciones?: string;
}
