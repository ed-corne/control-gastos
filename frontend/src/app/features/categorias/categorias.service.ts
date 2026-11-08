import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, GuardarCategoria, TipoCategoria } from './categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/categorias`;

  listar(tipo: TipoCategoria, incluirArchivadas: boolean): Observable<Categoria[]> {
    const params = new HttpParams().set('tipo', tipo).set('incluirArchivadas', incluirArchivadas);
    return this.http.get<Categoria[]>(this.url, { params });
  }

  crear(categoria: GuardarCategoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, categoria);
  }

  editar(id: string, categoria: GuardarCategoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.url}/${id}`, categoria);
  }

  archivar(id: string): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.url}/${id}/archivar`, {});
  }

  restaurar(id: string): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.url}/${id}/restaurar`, {});
  }
}
