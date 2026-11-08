import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cuenta, ICONOS_CUENTA, ResumenCuentas, TIPOS_CUENTA } from './cuenta.model';
import { MovimientosEstado } from '../movimientos/movimientos-estado';
import { CuentasService } from './cuentas.service';

@Component({
  selector: 'app-cuentas-page',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './cuentas-page.html',
  styleUrl: './cuentas-page.scss',
})
export class CuentasPage {
  private readonly api = inject(CuentasService);
  private readonly movimientos = inject(MovimientosEstado);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly tipos = TIPOS_CUENTA;
  protected readonly iconos = ICONOS_CUENTA;

  protected readonly cuentas = signal<Cuenta[]>([]);
  protected readonly resumen = signal<ResumenCuentas | null>(null);
  protected readonly incluirArchivadas = signal(false);
  protected readonly error = signal('');
  protected readonly formularioAbierto = signal(false);
  protected readonly editandoId = signal<string | null>(null);

  protected readonly titulo = computed(() => (this.editandoId() ? 'Editar cuenta' : 'Nueva cuenta'));

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    tipo: ['Debito' as Cuenta['tipo'], Validators.required],
    saldoInicial: [0, Validators.required],
    color: ['#4f46e5', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
    icono: ['wallet', Validators.required],
  });

  constructor() {
    // Los saldos cambian al registrar movimientos desde cualquier pantalla.
    effect(() => {
      this.movimientos.cambios();
      untracked(() => this.cargar());
    });
  }

  protected emoji(clave: string): string {
    return this.iconos.find((i) => i.clave === clave)?.emoji ?? '👛';
  }

  protected etiquetaTipo(tipo: Cuenta['tipo']): string {
    return this.tipos.find((t) => t.valor === tipo)?.etiqueta ?? tipo;
  }

  protected alternarArchivadas(): void {
    this.incluirArchivadas.update((v) => !v);
    this.cargar();
  }

  protected nueva(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre: '', tipo: 'Debito', saldoInicial: 0, color: '#4f46e5', icono: 'wallet' });
    this.formularioAbierto.set(true);
  }

  protected editar(c: Cuenta): void {
    this.editandoId.set(c.id);
    this.form.reset({
      nombre: c.nombre,
      tipo: c.tipo,
      saldoInicial: c.saldoInicial,
      color: c.color,
      icono: c.icono,
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
    const datos = this.form.getRawValue();
    const id = this.editandoId();
    const peticion = id ? this.api.editar(id, datos) : this.api.crear(datos);

    peticion.subscribe({
      next: () => {
        this.formularioAbierto.set(false);
        this.cargar();
      },
      error: () => this.error.set('No se pudo guardar la cuenta.'),
    });
  }

  protected alternarArchivo(c: Cuenta): void {
    const accion = c.archivada ? this.api.restaurar(c.id) : this.api.archivar(c.id);
    accion.subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo actualizar la cuenta.'),
    });
  }

  protected eliminar(c: Cuenta): void {
    if (!confirm(`¿Eliminar la cuenta "${c.nombre}"? Esta acción no se puede deshacer.`)) return;
    this.api.eliminar(c.id).subscribe({
      next: () => this.cargar(),
      error: (e) =>
        this.error.set(
          e instanceof HttpErrorResponse && e.status === 409 && e.error?.detail
            ? e.error.detail
            : 'No se pudo eliminar la cuenta.',
        ),
    });
  }

  private cargar(): void {
    this.error.set('');
    this.api.listar(this.incluirArchivadas()).subscribe({
      next: (lista) => this.cuentas.set(lista),
      error: () => this.error.set('No se pudieron cargar las cuentas. ¿Está corriendo la API?'),
    });
    this.api.resumen().subscribe({
      next: (r) => this.resumen.set(r),
      error: () => this.resumen.set(null),
    });
  }
}
