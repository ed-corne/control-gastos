/** Lee un CSV (RFC 4180): campos entre comillas, comillas dobles escapadas y saltos de línea dentro de un campo. */
export function parseCsv(texto: string): string[][] {
  if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1); // BOM

  // El delimitador se deduce de la primera línea: coma, punto y coma o tabulador.
  const primera = texto.split(/\r?\n/, 1)[0] ?? '';
  const delimitador = [',', ';', '\t']
    .map((d) => ({ d, n: primera.split(d).length }))
    .sort((a, b) => b.n - a.n)[0].d;

  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = '';
  let entreComillas = false;

  const cerrarFila = () => {
    fila.push(campo);
    campo = '';
    if (fila.some((c) => c.trim() !== '')) filas.push(fila);
    fila = [];
  };

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entreComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          entreComillas = false;
        }
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreComillas = true;
    } else if (c === delimitador) {
      fila.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      cerrarFila();
    } else {
      campo += c;
    }
  }
  if (campo !== '' || fila.length > 0) cerrarFila();

  return filas;
}

/**
 * Convierte un monto escrito como en una hoja de cálculo: "$1,234.50", "1.234,50", "(250)", "-99".
 * Devuelve null si no se puede interpretar.
 */
export function parseMonto(texto: string): number | null {
  let t = texto.trim();
  if (!t) return null;

  const negativoPorParentesis = /^\(.*\)$/.test(t);
  t = t.replace(/[^\d,.\-]/g, '');
  if (!/\d/.test(t)) return null;

  const coma = t.lastIndexOf(',');
  const punto = t.lastIndexOf('.');

  let decimalEsComa: boolean;
  if (coma > -1 && punto > -1) decimalEsComa = coma > punto; // el último separador es el decimal
  else if (coma > -1) decimalEsComa = /,\d{1,2}$/.test(t); // "12,5" decimal; "1,234" miles
  else decimalEsComa = false;

  t = decimalEsComa ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');

  const n = Number(t);
  if (Number.isNaN(n)) return null;
  return negativoPorParentesis ? -Math.abs(n) : n;
}

export type FormatoFecha = 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';

/** Convierte una fecha del archivo a yyyy-MM-dd. Devuelve null si no es una fecha real. */
export function parseFecha(texto: string, formato: FormatoFecha): string | null {
  const t = texto.trim().slice(0, 10);
  const partes = t.split(/[/\-.]/).map((p) => Number(p));
  if (partes.length !== 3 || partes.some((p) => !Number.isInteger(p))) return null;

  let [dia, mes, anio] = formato === 'dd/MM/yyyy' ? partes : formato === 'MM/dd/yyyy' ? [partes[1], partes[0], partes[2]] : [partes[2], partes[1], partes[0]];
  if (anio < 100) anio += 2000;

  const fecha = new Date(anio, mes - 1, dia);
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return null;

  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
