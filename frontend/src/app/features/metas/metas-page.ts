import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DineroPipe } from '../../core/dinero.pipe';
import { hoyIso } from '../movimientos/movimiento.model';
import { IconComponent, ICONOS_META_CLAVES } from '../../core/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { Meta, OperacionMeta, TipoOperacionMeta } from './meta.model';
import { MovimientosEstado } from '../movimientos/movimientos-estado';
import { MetasService } from './metas.service';

@Component({
  selector: 'app-metas-page',
  imports: [ReactiveFormsModule, DineroPipe, DatePipe, IconComponent, ModalComponent],
  templateUrl: './metas-page.html',
})
export class MetasPage {
  private readonly api = inject(MetasService);
  private readonly movimientos = inject(MovimientosEstado);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly iconos = ICONOS_META_CLAVES;
  protected readonly hoy = hoyIso();

  protected readonly verCumplidas = signal(false);
  protected readonly metas = signal<Meta[]>([]);
  protected readonly error = signal('');
  protected readonly formularioAbierto = signal(false);
  protected readonly editandoId = signal<string | null>(null);

  // Operación (aportar / retirar) sobre una meta
  protected readonly operandoId = signal<string | null>(null);
  protected readonly tipoOperacion = signal<TipoOperacionMeta>('Aportacion');

  // Historial expandido de una meta
  protected readonly historialId = signal<string | null>(null);
  protected readonly historial = signal<OperacionMeta[]>([]);

  protected readonly nombreOperando = computed(() => this.metas().find((m) => m.id === this.operandoId())?.nombre ?? '');

  protected readonly titulo = computed(() => (this.editandoId() ? 'Editar meta' : 'Nueva meta'));

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    montoObjetivo: [null as number | null, [Validators.required, Validators.min(0.01)]],
    fechaLimite: [''],
    color: ['#4f46e5', Validators.required],
    icono: ['target', Validators.required],
  });

  protected readonly formOperacion = this.fb.group({
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
    fecha: [hoyIso(), Validators.required],
    nota: [''],
  });

  constructor() {
    // Los aportes también se pueden registrar desde el formulario global de movimientos.
    effect(() => {
      this.movimientos.cambios();
      untracked(() => this.cargar());
    });
  }

  protected alternarHistorialMetas(cumplidas: boolean): void {
    this.verCumplidas.set(cumplidas);
    this.formularioAbierto.set(false);
    this.operandoId.set(null);
    this.historialId.set(null);
    this.cargar();
  }

  protected nueva(): void {
    this.error.set('');
    this.editandoId.set(null);
    this.form.reset({ nombre: '', montoObjetivo: null, fechaLimite: '', color: '#4f46e5', icono: 'target' });
    this.formularioAbierto.set(true);
  }

  protected editar(m: Meta): void {
    this.error.set('');
    this.editandoId.set(m.id);
    this.form.reset({
      nombre: m.nombre,
      montoObjetivo: m.montoObjetivo,
      fechaLimite: m.fechaLimite ?? '',
      color: m.color,
      icono: m.icono,
    });
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
    this.error.set('');
    const v = this.form.getRawValue();
    const datos = {
      nombre: v.nombre,
      montoObjetivo: Number(v.montoObjetivo),
      fechaLimite: v.fechaLimite || null,
      color: v.color,
      icono: v.icono,
    };
    const id = this.editandoId();

    (id ? this.api.editar(id, datos) : this.api.crear(datos)).subscribe({
      next: () => {
        this.formularioAbierto.set(false);
        this.cargar();
      },
      error: (e) => this.error.set(this.mensaje(e, 'No se pudo guardar la meta.')),
    });
  }

  protected abrirOperacion(m: Meta, tipo: TipoOperacionMeta): void {
    this.error.set('');
    this.operandoId.set(m.id);
    this.tipoOperacion.set(tipo);
    this.formOperacion.reset({ monto: null, fecha: hoyIso(), nota: '' });
  }

  protected cerrarOperacion(): void {
    this.operandoId.set(null);
  }

  protected registrarOperacion(): void {
    const id = this.operandoId();
    if (!id) return;
    if (this.formOperacion.invalid) {
      this.formOperacion.markAllAsTouched();
      return;
    }
    const v = this.formOperacion.getRawValue();
    this.error.set('');

    this.api
      .registrarOperacion(id, {
        tipo: this.tipoOperacion(),
        monto: Number(v.monto),
        fecha: v.fecha,
        nota: v.nota.trim() || null,
      })
      .subscribe({
        next: () => {
          this.operandoId.set(null);
          if (this.historialId() === id) this.cargarHistorial(id);
          this.cargar();
        },
        error: (e) => this.error.set(this.mensaje(e, 'No se pudo registrar la operación.')),
      });
  }

  protected alternarHistorial(m: Meta): void {
    if (this.historialId() === m.id) {
      this.historialId.set(null);
      return;
    }
    this.historialId.set(m.id);
    this.cargarHistorial(m.id);
  }

  protected ancho(m: Meta): number {
    return Math.min(100, m.porcentaje);
  }

  private cargarHistorial(id: string): void {
    this.api.operaciones(id).subscribe((lista) => this.historial.set(lista));
  }

  private cargar(): void {
    this.error.set('');
    this.api.listar(this.verCumplidas()).subscribe({
      next: (lista) => this.metas.set(lista),
      error: () => this.error.set('No se pudieron cargar las metas. ¿Está corriendo la API?'),
    });
  }

  private mensaje(e: unknown, porDefecto: string): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 409 && e.error?.detail) return e.error.detail;
      if (e.status === 400 && e.error?.errors) {
        const primero = Object.values<string[]>(e.error.errors)[0]?.[0];
        if (primero) return primero;
      }
    }
    return porDefecto;
  }
}
