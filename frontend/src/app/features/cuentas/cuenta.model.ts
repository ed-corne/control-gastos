export type TipoCuenta = 'Efectivo' | 'Debito' | 'Credito' | 'Ahorro' | 'Inversion';

export const TIPOS_CUENTA: { valor: TipoCuenta; etiqueta: string }[] = [
  { valor: 'Efectivo', etiqueta: 'Efectivo' },
  { valor: 'Debito', etiqueta: 'Débito' },
  { valor: 'Credito', etiqueta: 'Crédito' },
  { valor: 'Ahorro', etiqueta: 'Ahorro' },
  { valor: 'Inversion', etiqueta: 'Inversión' },
];

export const ICONOS_CUENTA: { clave: string; emoji: string }[] = [
  { clave: 'wallet', emoji: '👛' },
  { clave: 'cash', emoji: '💵' },
  { clave: 'bank', emoji: '🏦' },
  { clave: 'card', emoji: '💳' },
  { clave: 'savings', emoji: '🐖' },
  { clave: 'chart', emoji: '📈' },
];

export interface Cuenta {
  id: string;
  nombre: string;
  tipo: TipoCuenta;
  saldoInicial: number;
  saldoActual: number;
  color: string;
  icono: string;
  archivada: boolean;
}

export interface GuardarCuenta {
  nombre: string;
  tipo: TipoCuenta;
  saldoInicial: number;
  color: string;
  icono: string;
}

export interface ResumenCuentas {
  saldoTotal: number;
  totalActivos: number;
  totalDeudaTarjetas: number;
  cuentasActivas: number;
}
