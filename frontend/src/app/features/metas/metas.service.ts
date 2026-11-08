import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GuardarMeta, Meta, OperacionMeta, RegistrarOperacionMeta } from './meta.model';

@Injectable({ providedIn: 'root' })
export class MetasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/metas`;

  listar(cumplidas: boolean): Observable<Meta[]> {
    const params = new HttpParams().set('cumplidas', cumplidas);
    return this.http.get<Meta[]>(this.url, { params });
  }

  crear(m: GuardarMeta): Observable<Meta> {
    return this.http.post<Meta>(this.url, m);
  }

  editar(id: string, m: GuardarMeta): Observable<Meta> {
    return this.http.put<Meta>(`${this.url}/${id}`, m);
  }

  operaciones(id: string): Observable<OperacionMeta[]> {
    return this.http.get<OperacionMeta[]>(`${this.url}/${id}/operaciones`);
  }

  registrarOperacion(id: string, o: RegistrarOperacionMeta): Observable<Meta> {
    return this.http.post<Meta>(`${this.url}/${id}/operaciones`, o);
  }
}
