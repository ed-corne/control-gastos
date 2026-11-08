import { Pipe, PipeTransform, inject } from '@angular/core';
import { ConfiguracionStore } from './configuracion.store';
import { IdiomaService } from './idioma.service';

/** Da formato de moneda usando la moneda principal configurada por el usuario. */
@Pipe({ name: 'dinero', pure: false })
export class DineroPipe implements PipeTransform {
  private readonly config = inject(ConfiguracionStore);
  private readonly idioma = inject(IdiomaService);

  transform(valor: number | null | undefined, decimales = 2): string {
    if (valor === null || valor === undefined) return '';
    return new Intl.NumberFormat(this.idioma.locale(), {
      style: 'currency',
      currency: this.config.moneda(),
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }).format(valor);
  }
}
