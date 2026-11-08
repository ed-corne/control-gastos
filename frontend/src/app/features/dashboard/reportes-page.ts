import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DineroPipe } from '../../core/dinero.pipe';
import { forkJoin } from 'rxjs';
import { Categoria } from '../categorias/categoria.model';
import { CategoriasService } from '../categorias/categorias.service';
import { ConfiguracionStore } from '../../core/configuracion.store';
import { IconComponent } from '../../core/icon.component';
import { MovimientosEstado } from '../movimientos/movimientos-estado';
import { ComparativoMensual, IngresosGastosMes, RankingMes, SerieCategoria } from './dashboard.model';
import { DashboardService } from './dashboard.service';
import { IdiomaService } from '../../core/idioma.service';
import { TranslateService } from '@ngx-translate/core';

// Geometría compartida por los gráficos
const W = 720;
const H = 260;
const MARGEN = { izq: 56, der: 12, arriba: 12, abajo: 28 };
const ANCHO = W - MARGEN.izq - MARGEN.der;
const ALTO = H - MARGEN.arriba - MARGEN.abajo;

// Colores de datos validados (slot 1 azul, slot 2 naranja); cambian solos en modo oscuro (ver styles.css).
export const COLOR_INGRESOS = 'var(--series-1)';
export const COLOR_GASTOS = 'var(--series-2)';

interface Barra {
  x: number;
  y: number;
  alto: number;
  ancho: number;
  color: string;
  titulo: string;
}

interface BarraRanking extends Barra {
  anio: number;
  mes: number;
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
  imports: [TranslatePipe, DineroPipe, IconComponent],
  templateUrl: './reportes-page.html',
})
export class ReportesPage {
  protected readonly pestana = signal<'barras' | 'categoria' | 'comparativo' | 'ranking'>('barras');
  protected readonly pestanas = [
    { id: 'barras', etiqueta: 'Ingresos y gastos' },
    { id: 'categoria', etiqueta: 'Por categoría' },
    { id: 'comparativo', etiqueta: 'Mes contra mes' },
    { id: 'ranking', etiqueta: 'Categoría con más gasto' },
  ] as const;

  private readonly api = inject(DashboardService);
  private readonly categoriasApi = inject(CategoriasService);
  private readonly movimientos = inject(MovimientosEstado);
  private readonly config = inject(ConfiguracionStore);
  private readonly idioma = inject(IdiomaService);
  private readonly t = inject(TranslateService);

  protected readonly w = W;
  protected readonly h = H;
  protected readonly margen = MARGEN;
  protected readonly colorIngresos = COLOR_INGRESOS;
  protected readonly colorGastos = COLOR_GASTOS;

  protected readonly error = signal('');

  // Categoría con más gasto de cada mes
  protected readonly ranking = signal<RankingMes[]>([]);
  protected readonly rankingSel = signal<number | null>(null); // índice; null = el mes más reciente
  protected readonly rankingMesesDesc = computed(() => [...this.ranking()].reverse());
  protected readonly rankingMes = computed(() => {
    const lista = this.ranking();
    return lista[this.rankingSel() ?? lista.length - 1] ?? null;
  });
  protected readonly verGraficaRanking = signal(true);

  protected readonly escalaRanking = computed(() =>
    this.escalaNice(Math.max(0, ...this.ranking().map((r) => r.categorias[0]?.total ?? 0))),
  );
  protected readonly ticksRanking = computed(() => this.ticks(this.escalaRanking()));

  protected readonly marcasRanking = computed<Marca[]>(() => {
    const lista = this.ranking();
    const slot = ANCHO / Math.max(1, lista.length);
    return lista.map((r, i) => ({ x: MARGEN.izq + slot * (i + 0.5), etiqueta: this.etiquetaCorta(r.anio, r.mes) }));
  });

  /** Una barra por mes: alto = lo gastado en su categoría principal, color = el de esa categoría. */
  protected readonly barrasRanking = computed<BarraRanking[]>(() => {
    const lista = this.ranking();
    const max = this.escalaRanking();
    const slot = ANCHO / Math.max(1, lista.length);
    const ancho = Math.min(28, slot - 8);
    const base = MARGEN.arriba + ALTO;

    return lista.map((r, i) => {
      const top = r.total > 0 ? r.categorias[0] : null;
      const alto = top ? (top.total / max) * ALTO : 0;
      const etiqueta = this.etiquetaCorta(r.anio, r.mes);
      return {
        anio: r.anio, mes: r.mes,
        x: MARGEN.izq + slot * (i + 0.5) - ancho / 2, y: base - alto, alto, ancho,
        color: top?.color ?? 'transparent',
        titulo: top ? `${etiqueta} · ${top.nombre}: ${this.moneda(top.total)} (${top.porcentaje}% ${this.t.instant('del mes')})` : `${etiqueta} · ${this.t.instant('Sin gastos')}`,
      };
    });
  });

  /** Categorías que aparecen como la principal en algún mes, para la leyenda. */
  protected readonly leyendaRanking = computed(() => {
    const vistas = new Map<string, { nombre: string; color: string }>();
    for (const r of this.ranking()) {
      const top = r.total > 0 ? r.categorias[0] : null;
      if (top && !vistas.has(top.categoriaId)) vistas.set(top.categoriaId, { nombre: top.nombre, color: top.color });
    }
    return [...vistas.values()];
  });

  protected readonly maxRanking = computed(() => Math.max(1, ...(this.rankingMes()?.categorias.map((c) => c.total) ?? [])));
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
    new Date(this.anio(), this.mes() - 1, 1).toLocaleDateString(this.idioma.locale(), { month: 'long', year: 'numeric' }),
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
          color: COLOR_INGRESOS, titulo: `${etiqueta} · ${this.t.instant('Ingresos')}: ${this.moneda(m.ingresos)}`,
        },
        {
          x: centro + 1, y: base - alto(m.gastos), alto: alto(m.gastos), ancho,
          color: COLOR_GASTOS, titulo: `${etiqueta} · ${this.t.instant('Gastos')}: ${this.moneda(m.gastos)}`,
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

  protected elegirMesRanking(anio: number, mes: number): void {
    this.rankingSel.set(this.ranking().findIndex((r) => r.anio === anio && r.mes === mes));
  }

  protected esMesRanking(anio: number, mes: number): boolean {
    const r = this.rankingMes();
    return !!r && r.anio === anio && r.mes === mes;
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
    this.api.rankingCategorias(12).subscribe({
      next: (r) => this.ranking.set(r),
      error: () => this.ranking.set([]),
    });
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
    return n.toLocaleString(this.idioma.locale(), { style: 'currency', currency: this.config.moneda() });
  }

  private etiquetaCorta(anio: number, mes: number): string {
    return new Date(anio, mes - 1, 1).toLocaleDateString(this.idioma.locale(), { month: 'short' }).replace('.', '');
  }

  protected etiquetaMesTabla(anio: number, mes: number): string {
    return new Date(anio, mes - 1, 1).toLocaleDateString(this.idioma.locale(), { month: 'long', year: 'numeric' });
  }
}
