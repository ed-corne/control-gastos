import { Injectable, signal } from '@angular/core';
import { Movimiento } from './movimiento.model';

/**
 * Estado compartido: el formulario de movimientos se abre desde cualquier pantalla
 * y las pantallas se refrescan cuando `cambios` aumenta.
 */
@Injectable({ providedIn: 'root' })
export class MovimientosEstado {
  readonly cambios = signal(0);
  readonly formularioAbierto = signal(false);
  readonly modo = signal<'nuevo' | 'editar' | 'duplicar'>('nuevo');
  readonly base = signal<Movimiento | null>(null);

  nuevo(): void {
    this.abrir('nuevo', null);
  }

  editar(m: Movimiento): void {
    this.abrir('editar', m);
  }

  duplicar(m: Movimiento): void {
    this.abrir('duplicar', m);
  }

  cerrar(): void {
    this.formularioAbierto.set(false);
  }

  notificarCambio(): void {
    this.cambios.update((v) => v + 1);
  }

  private abrir(modo: 'nuevo' | 'editar' | 'duplicar', base: Movimiento | null): void {
    this.modo.set(modo);
    this.base.set(base);
    this.formularioAbierto.set(true);
  }
}
