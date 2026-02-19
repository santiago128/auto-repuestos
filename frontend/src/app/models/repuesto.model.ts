export interface Marca {
  id: number;
  nombre: string;
  paisOrigen?: string;
  activo?: boolean;
}

export interface Modelo {
  id: number;
  nombre: string;
  anioInicio?: number;
  anioFin?: number;
  marca: Marca;
  activo?: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Repuesto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  marca: Marca;
  modelo?: Modelo;
  categoria?: Categoria;
  imagenUrl?: string;
  activo?: boolean;
}

export interface CarritoItem {
  repuesto: Repuesto;
  cantidad: number;
}
