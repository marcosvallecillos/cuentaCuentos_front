import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StoryResponse } from '../models/story.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  generarHistoria(personaje: string, lugar: string, emocion: string, edad: number): Observable<StoryResponse> {
    return this.http.post<StoryResponse>(`${this.apiUrl}/generar-historia`, {
      personaje,
      lugar,
      emocion,
      edad
    });
  }


  continuarHistoria(
    historiaActual: string,
    nuevoObjeto: string,
    edad: number,
    interaccionNumero: number
  ): Observable<StoryResponse> {
    return this.http.post<StoryResponse>(`${this.apiUrl}/continuar-historia`, {
      historia_actual: historiaActual,
      nuevo_objeto: nuevoObjeto,
      edad,
      interaccion_numero: interaccionNumero
    });
  }

  obtenerGruposEdad(): Observable<any> {
    return this.http.get(`${this.apiUrl}/grupos-edad`);
  }
}