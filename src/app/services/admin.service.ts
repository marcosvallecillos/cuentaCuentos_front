import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
}

export interface CatalogItem {
  id?: number;
  tipo: 'protagonista' | 'lugar' | 'emocion';
  nombre: string;
  descripcion?: string;
  emoji?: string;
  prompt_sugerencia?: string;
  activo?: boolean;
  created_at?: string;
  veces_usado?: number;
}

export interface Story {
  id: number;
  edad_usuario: number;
  grupo_edad: string;
  preview?: string;
  texto_completo?: string;
  created_at: string;
  num_interacciones?: number;
  interacciones?: any[];
}

export interface StoryStats {
  total_historias: number;
  total_interacciones: number;
  historias_por_grupo: { [key: string]: number };
  promedio_interacciones: number;
  ultimas_historias: Story[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8000/api';
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  private setStoredToken(token: string) {
    localStorage.setItem('admin_token', token);
    this.tokenSubject.next(token);
  }

  private clearStoredToken() {
    localStorage.removeItem('admin_token');
    this.tokenSubject.next(null);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getStoredToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ============= AUTH =============

  login(username: string, password: string): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${this.apiUrl}/admin/login`, {
      username,
      password
    }).pipe(
      tap(response => this.setStoredToken(response.access_token))
    );
  }

  logout() {
    this.clearStoredToken();
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  verifyToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/verify`, {
      headers: this.getAuthHeaders()
    });
  }

  // ============= STORIES =============

  getStories(skip: number = 0, limit: number = 50, grupoEdad?: string): Observable<Story[]> {
    let url = `${this.apiUrl}/stories/?skip=${skip}&limit=${limit}`;
    if (grupoEdad) {
      url += `&grupo_edad=${grupoEdad}`;
    }
    return this.http.get<Story[]>(url);
  }

  getStory(id: number): Observable<Story> {
    return this.http.get<Story>(`${this.apiUrl}/stories/${id}`);
  }

  deleteStory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/stories/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getStats(): Observable<StoryStats> {
    return this.http.get<StoryStats>(`${this.apiUrl}/stories/stats/overview`);
  }

  // ============= CATALOG =============

  getCatalogItems(tipo?: string, activo: boolean = true): Observable<CatalogItem[]> {
    let url = `${this.apiUrl}/catalog/?activo=${activo}`;
    if (tipo) {
      url += `&tipo=${tipo}`;
    }
    return this.http.get<CatalogItem[]>(url);
  }

  createCatalogItem(item: CatalogItem): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${this.apiUrl}/catalog/`, item, {
      headers: this.getAuthHeaders()
    });
  }

  updateCatalogItem(id: number, item: Partial<CatalogItem>): Observable<CatalogItem> {
    return this.http.put<CatalogItem>(`${this.apiUrl}/catalog/${id}`, item, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCatalogItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/catalog/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}