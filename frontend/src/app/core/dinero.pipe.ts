import { Pipe, PipeTransform, inject } from '@angular/core';
import { ConfiguracionStore } from './configuracion.store';

/** Da formato de moneda usando la moneda principal configurada por el usuario. */
@Pipe({ name: 'dinero', pure: false })
export class DineroPipe implements PipeTransform {
  private readonly config = inject(ConfiguracionStore);

  transform(valor: number | null | undefined, decimales = 2): string {
    if (valor === null || valor === undefined) return '';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: this.config.moneda(),
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }).format(valor);
  }
}
