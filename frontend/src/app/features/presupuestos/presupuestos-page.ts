import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DineroPipe } from '../../core/dinero.pipe';
import { Categoria, ICONOS_CATEGORIA } from '../categorias/categoria.model';
import { CategoriasService } from '../categorias/categorias.service';
import { MovimientosEstado } from '../movimientos/movimientos-estado';
import { Presupuesto } from './presupuesto.model';
import { PresupuestosService } from './presupuestos.service';

@Component({
  selector: 'app-presupuestos-page',
  imports: [ReactiveFormsModule, DineroPipe],
  templateUrl: './presupuestos-page.html',
  styleUrl: './presupuestos-page.scss',
})
export class PresupuestosPage {
  private readonly api = inject(PresupuestosService);
  private readonly categoriasApi = inject(CategoriasService);
  private readonly movimientos = inject(MovimientosEstado);
  private readonly fb = inject(FormBuilder).nonNullable;

  private readonly ahora = new Date();
  protected readonly anio = signal(this.ahora.getFullYear());
  protected readonly mes = signal(this.ahora.getMonth() + 1);

  protected readonly presupuestos = signal<Presupuesto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly error = signal('');
  protected readonly aviso = signal('');
  protected readonly formularioAbierto = signal(false);
  protected readonly editandoId = signal<string | null>(null);

  protected readonly etiquetaMes = computed(() =>
    new Date(this.anio(), this.mes() - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
  );

  /** Categorías de gasto que todavía no tienen presupuesto este mes. */
  protected readonly disponibles = computed(() => {
    const usadas = new Set(this.presupuestos().map((p) => p.categoriaId));
    return this.categorias().filter((c) => !usadas.has(c.id));
  });

  protected readonly hayGlobal = computed(() => this.presupuestos().some((p) => p.categoriaId === null));

  protected readonly form = this.fb.group({
    categoriaId: [''], // vacío = presupuesto global
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  constructor() {
    this.categoriasApi.listar('Gasto', false).subscribe((c) => this.categorias.set(c));

    // Se recalcula al abrir y cuando se registra o cambia un movimiento.
    effect(() => {
      this.movimientos.cambios();
      untracked(() => this.cargar());
    });
  }

  protected emoji(clave: string | null): string {
    return clave === null ? '🎯' : (ICONOS_CATEGORIA.find((i) => i.clave === clave)?.emoji ?? '📦');
  }

  protected ancho(p: Presupuesto): number {
    return Math.min(100, p.porcentaje);
  }

  protected mesAnterior(): void {
    this.moverMes(-1);
  }

  protected mesSiguiente(): void {
    this.moverMes(1);
  }

  protected nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ categoriaId: this.hayGlobal() ? (this.disponibles()[0]?.id ?? '') : '', monto: null });
    this.formularioAbierto.set(true);
  }

  protected editar(p: Presupuesto): void {
    this.editandoId.set(p.id);
    this.form.reset({ categoriaId: p.categoriaId ?? '', monto: p.asignado });
    this.formularioAbierto.set(true);
  }

  protected cancelar(): void {
    this.formularioAbierto.set(false);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const monto = Number(v.monto);
    const id = this.editandoId();
    const peticion = id
      ? this.api.actualizar(id, monto)
      : this.api.crear({ categoriaId: v.categoriaId || null, anio: this.anio(), mes: this.mes(), monto });

    peticion.subscribe({
      next: () => {
        this.formularioAbierto.set(false);
        this.cargar();
      },
      error: (e) => this.error.set(this.mensaje(e, 'No se pudo guardar el presupuesto.')),
    });
  }

  protected eliminar(p: Presupuesto): void {
    if (!confirm(`¿Eliminar el presupuesto "${p.categoriaNombre}"?`)) return;
    this.api.eliminar(p.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo eliminar el presupuesto.'),
    });
  }

  protected copiarMesAnterior(): void {
    this.error.set('');
    this.aviso.set('');
    this.api.copiarMesAnterior(this.anio(), this.mes()).subscribe({
      next: (r) => {
        this.aviso.set(
          r.copiados > 0
            ? `Se copiaron ${r.copiados} presupuesto(s) del mes anterior.`
            : 'Ya tenías todos los presupuestos del mes anterior.',
        );
        this.cargar();
      },
      error: (e) => this.error.set(this.mensaje(e, 'No se pudo copiar el mes anterior.')),
    });
  }

  private moverMes(delta: number): void {
    const fecha = new Date(this.anio(), this.mes() - 1 + delta, 1);
    this.anio.set(fecha.getFullYear());
    this.mes.set(fecha.getMonth() + 1);
    this.formularioAbierto.set(false);
    this.aviso.set('');
    this.cargar();
  }

  private cargar(): void {
    this.error.set('');
    this.api.listar(this.anio(), this.mes()).subscribe({
      next: (lista) => this.presupuestos.set(lista),
      error: () => this.error.set('No se pudieron cargar los presupuestos. ¿Está corriendo la API?'),
    });
  }

  private mensaje(e: unknown, porDefecto: string): string {
    return e instanceof HttpErrorResponse && e.status === 409 && e.error?.detail ? e.error.detail : porDefecto;
  }
}
