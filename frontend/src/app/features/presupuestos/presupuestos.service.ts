import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GuardarPresupuesto, Presupuesto } from './presupuesto.model';

@Injectable({ providedIn: 'root' })
export class PresupuestosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/presupuestos`;

  listar(anio: number, mes: number): Observable<Presupuesto[]> {
    const params = new HttpParams().set('anio', anio).set('mes', mes);
    return this.http.get<Presupuesto[]>(this.url, { params });
  }

  crear(p: GuardarPresupuesto): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(this.url, p);
  }

  actualizar(id: string, monto: number): Observable<Presupuesto> {
    return this.http.put<Presupuesto>(`${this.url}/${id}`, { monto });
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  copiarMesAnterior(anio: number, mes: number): Observable<{ copiados: number }> {
    const params = new HttpParams().set('anio', anio).set('mes', mes);
    return this.http.post<{ copiados: number }>(`${this.url}/copiar-mes-anterior`, {}, { params });
  }
}
