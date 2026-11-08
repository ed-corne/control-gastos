import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { IconComponent } from '../../core/icon.component';
import { Categoria } from '../categorias/categoria.model';
import { CategoriasService } from '../categorias/categorias.service';
import { Cuenta } from '../cuentas/cuenta.model';
import { CuentasService } from '../cuentas/cuentas.service';
import { Meta } from '../metas/meta.model';
import { MetasService } from '../metas/metas.service';
import { GuardarMovimiento, Sugerencias, TipoMovimiento, hoyIso } from './movimiento.model';
import { MovimientosEstado } from './movimientos-estado';
import { MovimientosService } from './movimientos.service';

@Component({
  selector: 'app-movimiento-form',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './movimiento-form.html',
})
export class MovimientoForm {
  protected readonly estado = inject(MovimientosEstado);
  private readonly api = inject(MovimientosService);
  private readonly cuentasApi = inject(CuentasService);
  private readonly metasApi = inject(MetasService);
  private readonly categoriasApi = inject(CategoriasService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly tipos: TipoMovimiento[] = ['Gasto', 'Ingreso', 'Transferencia'];
  protected readonly tipo = signal<TipoMovimiento>('Gasto');
  protected readonly cuentas = signal<Cuenta[]>([]);
  protected readonly categoriasGasto = signal<Categoria[]>([]);
  protected readonly categoriasIngreso = signal<Categoria[]>([]);
  /** Pestaña “Meta”: en lugar de un movimiento, registra un aporte a una meta de ahorro. */
  protected readonly aporteMeta = signal(false);
  protected readonly metas = signal<Meta[]>([]);
  protected readonly sugerencias = signal<Sugerencias | null>(null);
  protected readonly error = signal('');
  protected readonly guardando = signal(false);
  protected readonly hoy = hoyIso();

  protected readonly titulo = computed(() => {
    if (this.aporteMeta()) return 'Aportar a una meta';
    const modo = this.estado.modo();
    return modo === 'editar' ? 'Editar movimiento' : modo === 'duplicar' ? 'Duplicar movimiento' : 'Nuevo movimiento';
  });

  protected readonly categorias = computed(() =>
    this.tipo() === 'Gasto' ? this.categoriasGasto() : this.categoriasIngreso(),
  );

  /** RF-MOV-02: las categorías más usadas aparecen primero como botones. */
  protected readonly frecuentes = computed(() => {
    const s = this.sugerencias();
    if (!s) return [];
    const ids = this.tipo() === 'Gasto' ? s.categoriasGastoFrecuentes : s.categoriasIngresoFrecuentes;
    const todas = this.categorias();
    return ids.map((id) => todas.find((c) => c.id === id)).filter((c): c is Categoria => !!c);
  });

  protected readonly form = this.fb.group({
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
    fecha: [hoyIso(), Validators.required],
    descripcion: [''],
    cuentaId: ['', Validators.required],
    cuentaDestinoId: [''],
    categoriaId: [''],
    metaId: [''],
  });

  constructor() {
    effect(() => {
      if (this.estado.formularioAbierto()) untracked(() => this.iniciar());
    });
  }

  protected elegirMeta(): void {
    this.aporteMeta.set(true);
    this.error.set('');
    if (!this.form.controls.metaId.value) this.form.controls.metaId.setValue(this.metas()[0]?.id ?? '');
  }

  protected cambiarTipo(t: TipoMovimiento): void {
    this.aporteMeta.set(false);
    this.tipo.set(t);
    this.form.controls.categoriaId.setValue('');
  }

  protected elegirCategoria(id: string): void {
    this.form.controls.categoriaId.setValue(id);
  }

  protected cerrar(): void {
    this.estado.cerrar();
  }

  protected guardar(): void {
    this.error.set('');
    if (this.aporteMeta()) {
      this.guardarAporte();
      return;
    }
    const v = this.form.getRawValue();
    const esTransferencia = this.tipo() === 'Transferencia';

    const falta = this.form.controls.monto.invalid || !v.cuentaId || (esTransferencia ? !v.cuentaDestinoId : !v.categoriaId);
    if (falta) {
      this.form.markAllAsTouched();
      this.error.set(
        esTransferencia ? 'Indica monto, cuenta de origen y cuenta destino.' : 'Indica monto, categoría y cuenta.',
      );
      return;
    }

    const datos: GuardarMovimiento = {
      tipo: this.tipo(),
      monto: Number(v.monto),
      fecha: v.fecha,
      descripcion: v.descripcion.trim() || null,
      cuentaId: v.cuentaId,
      cuentaDestinoId: esTransferencia ? v.cuentaDestinoId : null,
      categoriaId: esTransferencia ? null : v.categoriaId,
    };

    const editando = this.estado.modo() === 'editar' ? this.estado.base() : null;
    const peticion = editando ? this.api.editar(editando.id, datos) : this.api.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.estado.cerrar();
        this.estado.notificarCambio();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(this.mensaje(e));
      },
    });
  }

  private guardarAporte(): void {
    const v = this.form.getRawValue();
    if (this.form.controls.monto.invalid || !v.metaId) {
      this.form.markAllAsTouched();
      this.error.set('Indica el monto y la meta a la que quieres aportar.');
      return;
    }
    this.guardando.set(true);
    this.metasApi
      .registrarOperacion(v.metaId, {
        tipo: 'Aportacion',
        monto: Number(v.monto),
        fecha: v.fecha,
        nota: v.descripcion.trim() || null,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.estado.cerrar();
          this.estado.notificarCambio();
        },
        error: (e) => {
          this.guardando.set(false);
          this.error.set(this.mensaje(e));
        },
      });
  }

  private iniciar(): void {
    this.error.set('');
    this.aporteMeta.set(false);
    forkJoin({
      cuentas: this.cuentasApi.listar(false),
      gasto: this.categoriasApi.listar('Gasto', false),
      ingreso: this.categoriasApi.listar('Ingreso', false),
      sugerencias: this.api.sugerencias(),
      metas: this.metasApi.listar(false),
    }).subscribe({
      next: (r) => {
        this.cuentas.set(r.cuentas);
        this.categoriasGasto.set(r.gasto);
        this.categoriasIngreso.set(r.ingreso);
        this.sugerencias.set(r.sugerencias);
        this.metas.set(r.metas);
        this.llenarFormulario(r.cuentas, r.sugerencias);
      },
      error: () => this.error.set('No se pudieron cargar los datos. ¿Está corriendo la API?'),
    });
  }

  private llenarFormulario(cuentas: Cuenta[], s: Sugerencias): void {
    const base = this.estado.base();
    const modo = this.estado.modo();

    if (base) {
      this.tipo.set(base.tipo);
      this.form.reset({
        monto: base.monto,
        fecha: modo === 'duplicar' ? hoyIso() : base.fecha,
        descripcion: base.descripcion ?? '',
        cuentaId: base.cuentaId,
        cuentaDestinoId: base.cuentaDestinoId ?? '',
        categoriaId: base.categoriaId ?? '',
        metaId: '',
      });
      return;
    }

    // RF-MOV-02: hoy, la última cuenta usada y la categoría más frecuente.
    this.tipo.set('Gasto');
    const cuentaInicial = cuentas.find((c) => c.id === s.ultimaCuentaId)?.id ?? cuentas[0]?.id ?? '';
    this.form.reset({
      monto: null,
      fecha: hoyIso(),
      descripcion: '',
      cuentaId: cuentaInicial,
      cuentaDestinoId: '',
      categoriaId: '',
      metaId: '',
    });
  }

  private mensaje(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 409 && e.error?.detail) return e.error.detail;
      if (e.status === 400 && e.error?.errors) {
        const primero = Object.values<string[]>(e.error.errors)[0]?.[0];
        if (primero) return primero;
      }
    }
    return this.aporteMeta() ? 'No se pudo registrar el aporte.' : 'No se pudo guardar el movimiento.';
  }
}
