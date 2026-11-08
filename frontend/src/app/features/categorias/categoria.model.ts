export type TipoCategoria = 'Gasto' | 'Ingreso';

export interface Categoria {
  id: string;
  nombre: string;
  tipo: TipoCategoria;
  color: string;
  icono: string;
  archivada: boolean;
}

export interface GuardarCategoria {
  nombre: string;
  tipo: TipoCategoria;
  color: string;
  icono: string;
}
