import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export type TipoNotificacion = 'PresupuestoAlerta' | 'PresupuestoExcedido' | 'Recordatorio';

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  enlace: string;
}

/** Avisos dentro de la app (RF-NOT-01 y RF-NOT-03). */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/notificaciones`;

  readonly avisos = signal<Notificacion[]>([]);
  readonly cantidad = computed(() => this.avisos().length);

  actualizar(): void {
    this.http.get<Notificacion[]>(this.url).subscribe({
      next: (lista) => this.avisos.set(lista),
      error: () => this.avisos.set([]),
    });
  }
}
