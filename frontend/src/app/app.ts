import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HealthService } from './core/health.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly health = inject(HealthService);

  protected readonly apiStatus = signal<'cargando' | 'conectada' | 'sin conexión'>('cargando');
  protected readonly apiDetail = signal('');

  constructor() {
    this.health.check().subscribe({
      next: (r) => {
        this.apiStatus.set('conectada');
        this.apiDetail.set(`${r.service} · ${r.timestamp}`);
      },
      error: () => this.apiStatus.set('sin conexión')
    });
  }
}
