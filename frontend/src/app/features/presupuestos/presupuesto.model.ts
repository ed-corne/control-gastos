export type EstadoPresupuesto = 'Verde' | 'Amarillo' | 'Rojo';

export interface Presupuesto {
  id: string;
  categoriaId: string | null;
  categoriaNombre: string;
  categoriaColor: string | null;
  categoriaIcono: string | null;
  categoriaComentario: string | null;
  anio: number;
  mes: number;
  asignado: number;
  gastado: number;
  restante: number;
  porcentaje: number;
  estado: EstadoPresupuesto;
}

export interface GuardarPresupuesto {
  categoriaId: string | null;
  anio: number;
  mes: number;
  monto: number;
}
