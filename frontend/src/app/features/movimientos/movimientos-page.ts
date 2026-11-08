import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DineroPipe } from '../../core/dinero.pipe';
import { forkJoin } from 'rxjs';
import { Categoria, ICONOS_CATEGORIA } from '../categorias/categoria.model';
import { CategoriasService } from '../categorias/categorias.service';
import { Cuenta } from '../cuentas/cuenta.model';
import { CuentasService } from '../cuentas/cuentas.service';
import { FiltroMovimientos, Movimiento, hoyIso } from './movimiento.model';
import { MovimientosEstado } from './movimientos-estado';
import { MovimientosService } from './movimientos.service';

interface GrupoDia {
  fecha: string;
  etiqueta: string;
  items: Movimiento[];
}

@Component({
  selector: 'app-movimientos-page',
  imports: [ReactiveFormsModule, DineroPipe, RouterLink],
  templateUrl: './movimientos-page.html',
  styleUrl: './movimientos-page.scss',
})
export class MovimientosPage {
  protected readonly estado = inject(MovimientosEstado);
  private readonly api = inject(MovimientosService);
  private readonly cuentasApi = inject(CuentasService);
  private readonly categoriasApi = inject(CategoriasService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly cuentas = signal<Cuenta[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly items = signal<Movimiento[]>([]);
  protected readonly total = signal(0);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly filtrosVisibles = signal(false);

  protected readonly hayMas = computed(() => this.items().length < this.total());

  /** RF-MOV-05: lista agrupada por día. */
  protected readonly grupos = computed<GrupoDia[]>(() => {
    const mapa = new Map<string, Movimiento[]>();
    for (const m of this.items()) {
      const lista = mapa.get(m.fecha) ?? [];
      lista.push(m);
      mapa.set(m.fecha, lista);
    }
    return [...mapa.entries()].map(([fecha, items]) => ({ fecha, etiqueta: this.etiquetaDia(fecha), items }));
  });

  protected readonly filtros = this.fb.group({
    desde: [''],
    hasta: [''],
    tipo: [''],
    cuentaId: [''],
    categoriaId: [''],
    montoMin: [null as number | null],
    montoMax: [null as number | null],
    texto: [''],
  });

  constructor() {
    forkJoin({
      cuentas: this.cuentasApi.listar(true),
      gasto: this.categoriasApi.listar('Gasto', true),
      ingreso: this.categoriasApi.listar('Ingreso', true),
    }).subscribe((r) => {
      this.cuentas.set(r.cuentas);
      this.categorias.set([...r.gasto, ...r.ingreso]);
    });

    // Se recarga al iniciar y cada vez que se guarda un movimiento desde cualquier pantalla.
    effect(() => {
      this.estado.cambios();
      untracked(() => this.cargar(true));
    });
  }

  protected emoji(m: Movimiento): string {
    if (m.tipo === 'Transferencia') return '🔁';
    return ICONOS_CATEGORIA.find((i) => i.clave === m.categoriaIcono)?.emoji ?? '📦';
  }

  protected titulo(m: Movimiento): string {
    return m.descripcion || (m.tipo === 'Transferencia' ? 'Transferencia' : (m.categoriaNombre ?? ''));
  }

  protected subtitulo(m: Movimiento): string {
    return m.tipo === 'Transferencia'
      ? `${m.cuentaNombre} → ${m.cuentaDestinoNombre}`
      : `${m.categoriaNombre} · ${m.cuentaNombre}`;
  }

  protected alternarFiltros(): void {
    this.filtrosVisibles.update((v) => !v);
  }

  protected aplicar(): void {
    this.cargar(true);
  }

  protected limpiar(): void {
    this.filtros.reset({ desde: '', hasta: '', tipo: '', cuentaId: '', categoriaId: '', montoMin: null, montoMax: null, texto: '' });
    this.cargar(true);
  }

  protected cargarMas(): void {
    this.pagina.update((p) => p + 1);
    this.cargar(false);
  }

  protected exportar(): void {
    this.error.set('');
    this.api.exportar(this.filtroActual()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `movimientos-${hoyIso()}.csv`;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.error.set('No se pudo exportar los movimientos.'),
    });
  }

  protected eliminar(m: Movimiento): void {
    if (!confirm(`¿Eliminar "${this.titulo(m)}" por ${m.monto}? Esta acción no se puede deshacer.`)) return;
    this.api.eliminar(m.id).subscribe({
      next: () => this.estado.notificarCambio(),
      error: () => this.error.set('No se pudo eliminar el movimiento.'),
    });
  }

  private cargar(reiniciar: boolean): void {
    if (reiniciar) this.pagina.set(1);
    this.error.set('');
    this.cargando.set(true);

    this.api.listar(this.filtroActual(), this.pagina()).subscribe({
      next: (r) => {
        this.items.update((actual) => (reiniciar ? r.items : [...actual, ...r.items]));
        this.total.set(r.total);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar los movimientos. ¿Está corriendo la API?');
      },
    });
  }

  private filtroActual(): FiltroMovimientos {
    const f = this.filtros.getRawValue();
    return {
      desde: f.desde,
      hasta: f.hasta,
      tipo: f.tipo as FiltroMovimientos['tipo'],
      cuentaId: f.cuentaId,
      categoriaId: f.categoriaId,
      montoMin: f.montoMin,
      montoMax: f.montoMax,
      texto: f.texto.trim(),
    };
  }

  private etiquetaDia(fecha: string): string {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
