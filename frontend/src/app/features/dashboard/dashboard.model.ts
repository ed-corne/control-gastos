import { Movimiento } from '../movimientos/movimiento.model';
import { Presupuesto } from '../presupuestos/presupuesto.model';

export interface GastoCategoria {
  categoriaId: string;
  nombre: string;
  color: string;
  icono: string;
  total: number;
  porcentaje: number;
}

export interface Dashboard {
  desde: string;
  hasta: string;
  saldoTotal: number;
  ingresos: number;
  gastos: number;
  balance: number;
  gastosPorCategoria: GastoCategoria[];
  ultimosMovimientos: Movimiento[];
  presupuestosEnRiesgo: Presupuesto[];
}

export interface IngresosGastosMes {
  anio: number;
  mes: number;
  ingresos: number;
  gastos: number;
}

export interface PuntoMes {
  anio: number;
  mes: number;
  total: number;
}

export interface SerieCategoria {
  categoriaId: string;
  nombre: string;
  tipo: 'Gasto' | 'Ingreso';
  color: string;
  serie: PuntoMes[];
}

export interface ComparativoCategoria {
  categoriaId: string;
  nombre: string;
  color: string;
  icono: string;
  actual: number;
  anterior: number;
  diferencia: number;
  variacionPorcentaje: number | null;
}

export interface ComparativoMensual {
  anio: number;
  mes: number;
  totalActual: number;
  totalAnterior: number;
  variacionPorcentaje: number | null;
  categorias: ComparativoCategoria[];
}

export interface RankingCategoria {
  categoriaId: string;
  nombre: string;
  color: string;
  icono: string;
  total: number;
  porcentaje: number;
}

export interface RankingMes {
  anio: number;
  mes: number;
  total: number;
  categorias: RankingCategoria[];
}
