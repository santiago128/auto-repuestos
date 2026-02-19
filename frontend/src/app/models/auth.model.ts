export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  id: number;
}

export interface UsuarioSession {
  token: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  id: number;
}
