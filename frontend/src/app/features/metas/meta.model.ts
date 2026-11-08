export const ICONOS_META: { clave: string; emoji: string }[] = [
  { clave: 'target', emoji: '🎯' },
  { clave: 'travel', emoji: '✈️' },
  { clave: 'home', emoji: '🏠' },
  { clave: 'car', emoji: '🚗' },
  { clave: 'education', emoji: '🎓' },
  { clave: 'wedding', emoji: '💍' },
  { clave: 'emergency', emoji: '🛟' },
  { clave: 'gift', emoji: '🎁' },
];

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
  ahorroMensualSugerido: number | null;
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
