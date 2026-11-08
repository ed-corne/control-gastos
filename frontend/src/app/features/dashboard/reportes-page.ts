import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { DineroPipe } from '../../core/dinero.pipe';
import { forkJoin } from 'rxjs';
import { Categoria } from '../categorias/categoria.model';
import { CategoriasService } from '../categorias/categorias.service';
import { ConfiguracionStore } from '../../core/configuracion.store';
import { MovimientosEstado } from '../movimientos/movimientos-estado';
import { ComparativoMensual, IngresosGastosMes, SerieCategoria } from './dashboard.model';
import { DashboardService } from './dashboard.service';

// Geometría compartida por los gráficos
const W = 720;
const H = 260;
const MARGEN = { izq: 56, der: 12, arriba: 12, abajo: 28 };
const ANCHO = W - MARGEN.izq - MARGEN.der;
const ALTO = H - MARGEN.arriba - MARGEN.abajo;

// Paleta de datos validada: slot 1 azul (ingresos) y slot 2 naranja (gastos).
export const COLOR_INGRESOS = '#2a78d6';
export const COLOR_GASTOS = '#eb6834';

interface Barra {
  x: number;
  y: number;
  alto: number;
  ancho: number;
  color: string;
  titulo: string;
}

interface Marca {
  x: number;
  etiqueta: string;
}

interface Tick {
  y: number;
  etiqueta: string;
}

interface Punto {
  x: number;
  y: number;
  titulo: string;
}

@Component({
  selector: 'app-reportes-page',
  imports: [DineroPipe],
  templateUrl: './reportes-page.html',
  styleUrl: './reportes-page.scss',
})
export class ReportesPage {
  private readonly api = inject(DashboardService);
  private readonly categoriasApi = inject(CategoriasService);
  private readonly movimientos = inject(MovimientosEstado);
  private readonly config = inject(ConfiguracionStore);

  protected readonly w = W;
  protected readonly h = H;
  protected readonly margen = MARGEN;
  protected readonly colorIngresos = COLOR_INGRESOS;
  protected readonly colorGastos = COLOR_GASTOS;

  protected readonly error = signal('');
  protected readonly meses = signal<IngresosGastosMes[]>([]);
  protected readonly verTablaBarras = signal(false);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaId = signal('');
  protected readonly serie = signal<SerieCategoria | null>(null);
  protected readonly verTablaLinea = signal(false);

  private readonly ahora = new Date();
  protected readonly anio = signal(this.ahora.getFullYear());
  protected readonly mes = signal(this.ahora.getMonth() + 1);
  protected readonly comparativo = signal<ComparativoMensual | null>(null);

  protected readonly etiquetaMes = computed(() =>
    new Date(this.anio(), this.mes() - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
  );

  // ----- RF-REP-01: barras de ingresos contra gastos -----
  protected readonly escalaBarras = computed(() => {
    const max = Math.max(0, ...this.meses().flatMap((m) => [m.ingresos, m.gastos]));
    return this.escalaNice(max);
  });

  protected readonly ticksBarras = computed(() => this.ticks(this.escalaBarras()));

  protected readonly marcasX = computed<Marca[]>(() => {
    const lista = this.meses();
    const slot = ANCHO / Math.max(1, lista.length);
    return lista.map((m, i) => ({ x: MARGEN.izq + slot * (i + 0.5), etiqueta: this.etiquetaCorta(m.anio, m.mes) }));
  });

  protected readonly barras = computed<Barra[]>(() => {
    const lista = this.meses();
    const max = this.escalaBarras();
    const slot = ANCHO / Math.max(1, lista.length);
    const ancho = Math.min(14, slot / 2 - 3);
    const base = MARGEN.arriba + ALTO;

    return lista.flatMap((m, i) => {
      const centro = MARGEN.izq + slot * (i + 0.5);
      const etiqueta = this.etiquetaCorta(m.anio, m.mes);
      const alto = (v: number) => (v / max) * ALTO;
      return [
        {
          x: centro - ancho - 1, y: base - alto(m.ingresos), alto: alto(m.ingresos), ancho,
          color: COLOR_INGRESOS, titulo: `${etiqueta} · Ingresos: ${this.moneda(m.ingresos)}`,
        },
        {
          x: centro + 1, y: base - alto(m.gastos), alto: alto(m.gastos), ancho,
          color: COLOR_GASTOS, titulo: `${etiqueta} · Gastos: ${this.moneda(m.gastos)}`,
        },
      ];
    });
  });

  // ----- RF-REP-02: línea de una categoría -----
  protected readonly escalaLinea = computed(() => this.escalaNice(Math.max(0, ...(this.serie()?.serie.map((p) => p.total) ?? []))));
  protected readonly ticksLinea = computed(() => this.ticks(this.escalaLinea()));

  protected readonly marcasLinea = computed<Marca[]>(() => {
    const s = this.serie()?.serie ?? [];
    const paso = ANCHO / Math.max(1, s.length - 1);
    return s.map((p, i) => ({ x: MARGEN.izq + paso * i, etiqueta: this.etiquetaCorta(p.anio, p.mes) }));
  });

  protected readonly puntos = computed<Punto[]>(() => {
    const s = this.serie();
    if (!s) return [];
    const max = this.escalaLinea();
    const paso = ANCHO / Math.max(1, s.serie.length - 1);
    return s.serie.map((p, i) => ({
      x: MARGEN.izq + paso * i,
      y: MARGEN.arriba + ALTO - (p.total / max) * ALTO,
      titulo: `${this.etiquetaCorta(p.anio, p.mes)} · ${s.nombre}: ${this.moneda(p.total)}`,
    }));
  });

  protected readonly trazo = computed(() => this.puntos().map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '));

  constructor() {
    forkJoin({
      gasto: this.categoriasApi.listar('Gasto', true),
      ingreso: this.categoriasApi.listar('Ingreso', true),
    }).subscribe((r) => {
      const todas = [...r.gasto, ...r.ingreso];
      this.categorias.set(todas);
      const primera = r.gasto[0]?.id ?? todas[0]?.id ?? '';
      if (primera) this.elegirCategoria(primera);
    });

    effect(() => {
      this.movimientos.cambios();
      untracked(() => this.cargarTodo());
    });
  }

  protected elegirCategoria(id: string): void {
    this.categoriaId.set(id);
    if (!id) {
      this.serie.set(null);
      return;
    }
    this.api.serieCategoria(id, 12).subscribe({
      next: (s) => this.serie.set(s),
      error: () => this.error.set('No se pudo cargar la serie de la categoría.'),
    });
  }

  protected mesAnterior(): void {
    this.moverMes(-1);
  }

  protected mesSiguiente(): void {
    this.moverMes(1);
  }

  protected abs(n: number): number {
    return Math.abs(n);
  }

  protected claseVariacion(v: number | null): string {
    if (v === null || v === 0) return '';
    return v > 0 ? 'sube' : 'baja'; // en gastos, subir es lo malo
  }

  protected flecha(v: number | null): string {
    if (v === null) return '';
    return v > 0 ? '▲' : v < 0 ? '▼' : '=';
  }

  private moverMes(delta: number): void {
    const f = new Date(this.anio(), this.mes() - 1 + delta, 1);
    this.anio.set(f.getFullYear());
    this.mes.set(f.getMonth() + 1);
    this.cargarComparativo();
  }

  private cargarTodo(): void {
    this.error.set('');
    this.api.ingresosGastos(12).subscribe({
      next: (m) => this.meses.set(m),
      error: () => this.error.set('No se pudieron cargar los reportes. ¿Está corriendo la API?'),
    });
    this.cargarComparativo();
    if (this.categoriaId()) this.elegirCategoria(this.categoriaId());
  }

  private cargarComparativo(): void {
    this.api.comparativo(this.anio(), this.mes()).subscribe({
      next: (c) => this.comparativo.set(c),
      error: () => this.comparativo.set(null),
    });
  }

  private escalaNice(max: number): number {
    if (max <= 0) return 100;
    const magnitud = Math.pow(10, Math.floor(Math.log10(max)));
    const n = max / magnitud;
    const paso = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return paso * magnitud;
  }

  private ticks(max: number): Tick[] {
    return [0, 1, 2, 3, 4].map((i) => ({
      y: MARGEN.arriba + ALTO - (i / 4) * ALTO,
      etiqueta: this.compacto((max * i) / 4),
    }));
  }

  private compacto(n: number): string {
    if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)} M`;
    if (n >= 1_000) return `${+(n / 1_000).toFixed(1)} k`;
    return String(n);
  }

  private moneda(n: number): string {
    return n.toLocaleString('es-MX', { style: 'currency', currency: this.config.moneda() });
  }

  private etiquetaCorta(anio: number, mes: number): string {
    return new Date(anio, mes - 1, 1).toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
  }

  protected etiquetaMesTabla(anio: number, mes: number): string {
    return new Date(anio, mes - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }
}
