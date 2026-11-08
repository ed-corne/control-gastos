import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComparativoMensual, Dashboard, IngresosGastosMes, RankingMes, SerieCategoria } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  dashboard(desde?: string, hasta?: string, mesAnterior = false): Observable<Dashboard> {
    let params = new HttpParams();
    if (mesAnterior) params = params.set('mesAnterior', true);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<Dashboard>(`${this.api}/dashboard`, { params });
  }

  ingresosGastos(meses = 12): Observable<IngresosGastosMes[]> {
    const params = new HttpParams().set('meses', meses);
    return this.http.get<IngresosGastosMes[]>(`${this.api}/reportes/ingresos-gastos`, { params });
  }

  serieCategoria(id: string, meses = 12): Observable<SerieCategoria> {
    const params = new HttpParams().set('meses', meses);
    return this.http.get<SerieCategoria>(`${this.api}/reportes/categoria/${id}`, { params });
  }

  rankingCategorias(meses = 12): Observable<RankingMes[]> {
    const params = new HttpParams().set('meses', meses);
    return this.http.get<RankingMes[]>(`${this.api}/reportes/ranking-categorias`, { params });
  }

  comparativo(anio: number, mes: number): Observable<ComparativoMensual> {
    const params = new HttpParams().set('anio', anio).set('mes', mes);
    return this.http.get<ComparativoMensual>(`${this.api}/reportes/comparativo`, { params });
  }
}
