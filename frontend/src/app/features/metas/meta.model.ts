export type TipoOperacionMeta = 'Aportacion' | 'Retiro';

export interface Meta {
  id: string;
  nombre: string;
  montoObjetivo: number;
  fechaLimite: string | null;
  icono: string;
  color: string;
  ahorrado: number;
  falta: number;
  porcentaje: number;
  cumplida: boolean;
  fechaCumplida: string | null;
  ahorroSemanalSugerido: number | null;
  vencida: boolean;
}

export interface GuardarMeta {
  nombre: string;
  montoObjetivo: number;
  fechaLimite: string | null;
  icono: string;
  color: string;
}

export interface OperacionMeta {
  id: string;
  tipo: TipoOperacionMeta;
  monto: number;
  fecha: string;
  nota: string | null;
}

export interface RegistrarOperacionMeta {
  tipo: TipoOperacionMeta;
  monto: number;
  fecha: string;
  nota: string | null;
}
