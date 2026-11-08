import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DineroPipe } from '../../core/dinero.pipe';
import { IconComponent } from '../../core/icon.component';
import { Movimiento } from '../movimientos/movimiento.model';
import { MovimientosEstado } from '../movimientos/movimientos-estado';
import { Dashboard } from './dashboard.model';
import { DashboardService } from './dashboard.service';

type Periodo = 'actual' | 'anterior' | 'rango';

interface Segmento {
  nombre: string;
  color: string;
  total: number;
  porcentaje: number;
  dash: string;
  offset: number;
}

const RADIO = 70;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

@Component({
  selector: 'app-dashboard-page',
  imports: [DineroPipe, DatePipe, FormsModule, IconComponent],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly api = inject(DashboardService);
  private readonly movimientos = inject(MovimientosEstado);

  protected readonly periodo = signal<Periodo>('actual');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  protected readonly datos = signal<Dashboard | null>(null);
  protected readonly error = signal('');
  protected readonly radio = RADIO;

  /** RF-DSH-02: dona de gastos por categoría, con el color propio de cada categoría. */
  protected readonly segmentos = computed<Segmento[]>(() => {
    const d = this.datos();
    if (!d || d.gastos === 0) return [];

    let acumulado = 0;
    return d.gastosPorCategoria.map((c) => {
      const largo = (c.total / d.gastos) * CIRCUNFERENCIA;
      const seg: Segmento = {
        nombre: c.nombre,
        color: c.color,
        total: c.total,
        porcentaje: c.porcentaje,
        dash: `${Math.max(0, largo - 2)} ${CIRCUNFERENCIA}`, // 2 px de separación entre segmentos
        offset: -acumulado,
      };
      acumulado += largo;
      return seg;
    });
  });

  constructor() {
    effect(() => {
      this.movimientos.cambios();
      untracked(() => this.cargar());
    });
  }

  protected cambiarPeriodo(p: Periodo): void {
    this.periodo.set(p);
    if (p !== 'rango') this.cargar();
  }

  protected aplicarRango(): void {
    if (this.desde() && this.hasta()) this.cargar();
  }

  protected icono(m: Movimiento): string {
    return m.tipo === 'Transferencia' ? 'transferencia' : (m.categoriaIcono ?? 'other');
  }

  protected titulo(m: Movimiento): string {
    return m.descripcion || (m.tipo === 'Transferencia' ? 'Transferencia' : (m.categoriaNombre ?? ''));
  }

  protected anchoPresupuesto(p: number): number {
    return Math.min(100, p);
  }

  private cargar(): void {
    this.error.set('');
    const { desde, hasta } = this.rango();
    this.api.dashboard(desde, hasta, this.periodo() === 'anterior').subscribe({
      next: (d) => this.datos.set(d),
      error: () => this.error.set('No se pudo cargar el resumen. ¿Está corriendo la API?'),
    });
  }

  private rango(): { desde?: string; hasta?: string } {
    if (this.periodo() === 'rango') return { desde: this.desde(), hasta: this.hasta() };
    return {}; // mes actual o anterior: lo resuelve la API según el mes financiero
  }
}
