import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Configuracion {
  nombre: string;
  moneda: string;
  zonaHoraria: string;
  diaInicioMes: number;
  recordatorioActivo: boolean;
  recordatorioHora: string; // HH:mm
}

const POR_DEFECTO: Configuracion = {
  nombre: '',
  moneda: 'MXN',
  zonaHoraria: 'America/Mexico_City',
  diaInicioMes: 1,
  recordatorioActivo: false,
  recordatorioHora: '20:00',
};

/** Configuración del usuario, cargada una vez y compartida por toda la app. */
@Injectable({ providedIn: 'root' })
export class ConfiguracionStore {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/configuracion`;

  readonly config = signal<Configuracion>(POR_DEFECTO);
  readonly moneda = computed(() => this.config().moneda);
  readonly diaInicioMes = computed(() => this.config().diaInicioMes);

  cargar(): void {
    this.http.get<Configuracion>(this.url).subscribe({
      next: (c) => this.config.set(c),
      error: () => this.config.set(POR_DEFECTO),
    });
  }

  guardar(c: Configuracion): Observable<Configuracion> {
    return this.http.put<Configuracion>(this.url, c).pipe(tap((g) => this.config.set(g)));
  }
}
