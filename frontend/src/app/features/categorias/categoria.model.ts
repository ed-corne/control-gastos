export type TipoCategoria = 'Gasto' | 'Ingreso';

export const ICONOS_CATEGORIA: { clave: string; emoji: string }[] = [
  { clave: 'food', emoji: '🍔' },
  { clave: 'transport', emoji: '🚌' },
  { clave: 'home', emoji: '🏠' },
  { clave: 'services', emoji: '💡' },
  { clave: 'health', emoji: '🩺' },
  { clave: 'entertainment', emoji: '🎬' },
  { clave: 'clothes', emoji: '👕' },
  { clave: 'education', emoji: '🎓' },
  { clave: 'salary', emoji: '💼' },
  { clave: 'freelance', emoji: '💻' },
  { clave: 'other', emoji: '📦' },
];

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
