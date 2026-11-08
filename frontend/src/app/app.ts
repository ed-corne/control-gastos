import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HealthService } from './core/health.service';
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

  protected readonly apiStatus = signal<'cargando' | 'conectada' | 'sin conexión'>('cargando');

  constructor() {
    this.health.check().subscribe({
      next: () => this.apiStatus.set('conectada'),
      error: () => this.apiStatus.set('sin conexión')
    });
  }
}
