import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../core/icon.component';
import { Cuenta } from '../cuentas/cuenta.model';
import { CuentasService } from '../cuentas/cuentas.service';
import { MovimientosEstado } from '../movimientos/movimientos-estado';
import { FormatoFecha, parseCsv, parseFecha, parseMonto } from './csv';
import { FilaImportacion, ImportacionService, ResultadoImportacion } from './importacion.service';

type Campo = 'fecha' | 'monto' | 'tipo' | 'categoria' | 'cuenta' | 'descripcion';

const MAX_FILAS = 5000;

const CAMPOS: { clave: Campo; etiqueta: string; obligatorio: boolean; pistas: string[] }[] = [
  { clave: 'fecha', etiqueta: 'Fecha', obligatorio: true, pistas: ['fecha', 'date', 'dia'] },
  { clave: 'monto', etiqueta: 'Monto', obligatorio: true, pistas: ['monto', 'importe', 'cantidad', 'amount', 'total'] },
  { clave: 'tipo', etiqueta: 'Tipo (Gasto / Ingreso)', obligatorio: false, pistas: ['tipo', 'type'] },
  { clave: 'categoria', etiqueta: 'Categoría', obligatorio: false, pistas: ['categoria', 'category', 'rubro'] },
  { clave: 'cuenta', etiqueta: 'Cuenta', obligatorio: false, pistas: ['cuenta', 'account', 'banco'] },
  { clave: 'descripcion', etiqueta: 'Descripción', obligatorio: false, pistas: ['descripcion', 'concepto', 'detalle', 'nota', 'comentario'] },
];

@Component({
  selector: 'app-importar-page',
  imports: [TranslatePipe, FormsModule, IconComponent],
  templateUrl: './importar-page.html',
})
export class ImportarPage {
  private readonly api = inject(ImportacionService);
  private readonly cuentasApi = inject(CuentasService);
  private readonly movimientos = inject(MovimientosEstado);

  protected readonly campos = CAMPOS;
  protected readonly maxFilas = MAX_FILAS;

  protected readonly cuentas = signal<Cuenta[]>([]);
  protected readonly nombreArchivo = signal('');
  protected readonly encabezados = signal<string[]>([]);
  protected readonly datos = signal<string[][]>([]);
  protected readonly error = signal('');
  protected readonly trabajando = signal(false);

  // Opciones
  protected readonly mapeo = signal<Record<Campo, number>>({
    fecha: -1, monto: -1, tipo: -1, categoria: -1, cuenta: -1, descripcion: -1,
  });
  protected readonly formatoFecha = signal<FormatoFecha>('dd/MM/yyyy');
  protected readonly cuentaPredeterminadaId = signal('');
  protected readonly positivosSonGastos = signal(true);
  protected readonly omitirDuplicados = signal(true);

  protected readonly resultado = signal<ResultadoImportacion | null>(null);
  protected readonly yaImportado = signal(false);

  protected readonly vistaPrevia = computed(() => this.datos().slice(0, 5));

  protected readonly listo = computed(
    () => this.mapeo().fecha >= 0 && this.mapeo().monto >= 0 && this.datos().length > 0,
  );

  /** Solo se muestran las filas con algo que decir (errores, duplicadas o avisos). */
  protected readonly filasConProblema = computed(() =>
    (this.resultado()?.filas ?? []).filter((f) => f.estado !== 'Valida' || f.mensaje).slice(0, 100),
  );

  constructor() {
    this.cuentasApi.listar(false).subscribe((c) => {
      this.cuentas.set(c);
      this.cuentaPredeterminadaId.set(c[0]?.id ?? '');
    });
  }

  protected async elegirArchivo(evento: Event): Promise<void> {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0];
    if (!archivo) return;

    this.reiniciar();
    if (/\.(xlsx|xls)$/i.test(archivo.name)) {
      this.error.set('Los archivos de Excel no se pueden leer directo. En Excel usa Archivo → Guardar como → CSV UTF-8 y vuelve a elegirlo.');
      return;
    }

    const filas = parseCsv(await archivo.text());
    if (filas.length < 2) {
      this.error.set('El archivo no tiene datos. La primera fila debe ser el encabezado.');
      return;
    }
    if (filas.length - 1 > MAX_FILAS) {
      this.error.set(`El archivo tiene ${filas.length - 1} filas y el máximo es ${MAX_FILAS}. Divídelo en varios archivos.`);
      return;
    }

    this.nombreArchivo.set(archivo.name);
    this.encabezados.set(filas[0]);
    this.datos.set(filas.slice(1));
    this.mapeo.set(this.adivinarMapeo(filas[0]));
  }

  protected cambiarMapeo(campo: Campo, valor: string): void {
    this.mapeo.update((m) => ({ ...m, [campo]: Number(valor) }));
    this.resultado.set(null);
  }

  protected revisar(): void {
    this.enviar(true);
  }

  protected importar(): void {
    this.enviar(false);
  }

  protected reiniciar(): void {
    this.nombreArchivo.set('');
    this.encabezados.set([]);
    this.datos.set([]);
    this.resultado.set(null);
    this.yaImportado.set(false);
    this.error.set('');
  }

  private enviar(soloValidar: boolean): void {
    this.error.set('');
    this.trabajando.set(true);

    this.api
      .importar({
        cuentaPredeterminadaId: this.cuentaPredeterminadaId() || null,
        positivosSonGastos: this.positivosSonGastos(),
        soloValidar,
        omitirDuplicados: this.omitirDuplicados(),
        filas: this.construirFilas(),
      })
      .subscribe({
        next: (r) => {
          this.trabajando.set(false);
          this.resultado.set(r);
          if (!soloValidar) {
            this.yaImportado.set(true);
            this.movimientos.notificarCambio();
          }
        },
        error: (e) => {
          this.trabajando.set(false);
          this.error.set(this.mensaje(e));
        },
      });
  }

  private construirFilas(): FilaImportacion[] {
    const m = this.mapeo();
    const celda = (fila: string[], campo: Campo) => (m[campo] >= 0 ? (fila[m[campo]] ?? '').trim() : '');

    return this.datos().map((fila, i) => ({
      numero: i + 2, // +1 por el encabezado, +1 porque las filas se cuentan desde 1
      fecha: parseFecha(celda(fila, 'fecha'), this.formatoFecha()),
      monto: parseMonto(celda(fila, 'monto')),
      tipo: celda(fila, 'tipo') || null,
      categoria: celda(fila, 'categoria') || null,
      cuenta: celda(fila, 'cuenta') || null,
      descripcion: celda(fila, 'descripcion') || null,
    }));
  }

  private adivinarMapeo(encabezados: string[]): Record<Campo, number> {
    const normalizar = (t: string) =>
      t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const limpios = encabezados.map(normalizar);

    const resultado = { fecha: -1, monto: -1, tipo: -1, categoria: -1, cuenta: -1, descripcion: -1 } as Record<Campo, number>;
    for (const campo of CAMPOS) {
      resultado[campo.clave] = limpios.findIndex((h) => campo.pistas.some((p) => h.includes(p)));
    }
    return resultado;
  }

  private mensaje(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 409 && e.error?.detail) return e.error.detail;
      if (e.status === 400 && e.error?.errors) {
        const primero = Object.values<string[]>(e.error.errors)[0]?.[0];
        if (primero) return primero;
      }
    }
    return 'No se pudo procesar el archivo. ¿Está corriendo la API?';
  }
}
