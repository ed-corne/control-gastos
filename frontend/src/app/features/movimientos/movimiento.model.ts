export type TipoMovimiento = 'Gasto' | 'Ingreso' | 'Transferencia';

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string; // yyyy-MM-dd
  descripcion: string | null;
  cuentaId: string;
  cuentaNombre: string;
  cuentaDestinoId: string | null;
  cuentaDestinoNombre: string | null;
  categoriaId: string | null;
  categoriaNombre: string | null;
  categoriaColor: string | null;
  categoriaIcono: string | null;
}

export interface GuardarMovimiento {
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  descripcion: string | null;
  cuentaId: string;
  cuentaDestinoId: string | null;
  categoriaId: string | null;
}

export interface Pagina<T> {
  items: T[];
  total: number;
  pagina: number;
  tamano: number;
}

export interface Sugerencias {
  ultimaCuentaId: string | null;
  categoriasGastoFrecuentes: string[];
  categoriasIngresoFrecuentes: string[];
}

export interface FiltroMovimientos {
  desde?: string;
  hasta?: string;
  tipo?: TipoMovimiento | '';
  cuentaId?: string;
  categoriaId?: string;
  montoMin?: number | null;
  montoMax?: number | null;
  texto?: string;
}

/** Fecha local de hoy como yyyy-MM-dd (sin desfase por zona horaria). */
export function hoyIso(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}
