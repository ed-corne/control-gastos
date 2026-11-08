import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FiltroMovimientos,
  GuardarMovimiento,
  Movimiento,
  Pagina,
  Sugerencias,
} from './movimiento.model';

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/movimientos`;

  listar(filtro: FiltroMovimientos, pagina: number, tamano = 30): Observable<Pagina<Movimiento>> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return this.http.get<Pagina<Movimiento>>(this.url, { params });
  }

  sugerencias(): Observable<Sugerencias> {
    return this.http.get<Sugerencias>(`${this.url}/sugerencias`);
  }

  crear(m: GuardarMovimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.url, m);
  }

  editar(id: string, m: GuardarMovimiento): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.url}/${id}`, m);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
