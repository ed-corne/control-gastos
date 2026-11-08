export type TipoCategoria = 'Gasto' | 'Ingreso';

export interface Categoria {
  id: string;
  nombre: string;
  tipo: TipoCategoria;
  color: string;
  icono: string;
  comentario: string | null;
  archivada: boolean;
}

export interface GuardarCategoria {
  nombre: string;
  tipo: TipoCategoria;
  color: string;
  icono: string;
  comentario: string | null;
}
