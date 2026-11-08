import { Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfiguracionStore } from './core/configuracion.store';
import { HealthService } from './core/health.service';
import { NotificacionesService } from './core/notificaciones.service';
import { MovimientoForm } from './features/movimientos/movimiento-form';
import { MovimientosEstado } from './features/movimientos/movimientos-estado';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MovimientoForm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly health = inject(HealthService);
  protected readonly estado = inject(MovimientosEstado);
  protected readonly config = inject(ConfiguracionStore);
  protected readonly notificaciones = inject(NotificacionesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly panelAbierto = signal(false);

  protected readonly apiStatus = signal<'cargando' | 'conectada' | 'sin conexión'>('cargando');

  constructor() {
    this.config.cargar();

    // Los avisos se recalculan al guardar movimientos o cambiar la configuración,
    // y cada minuto para que el recordatorio aparezca a su hora.
    effect(() => {
      this.estado.cambios();
      this.config.config();
      untracked(() => this.notificaciones.actualizar());
    });
    const reloj = setInterval(() => this.notificaciones.actualizar(), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(reloj));

    this.health.check().subscribe({
      next: () => this.apiStatus.set('conectada'),
      error: () => this.apiStatus.set('sin conexión')
    });
  }

  protected alternarPanel(): void {
    this.panelAbierto.update((v) => !v);
  }

  protected cerrarPanel(): void {
    this.panelAbierto.set(false);
  }
}
