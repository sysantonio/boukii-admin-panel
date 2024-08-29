import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private apiKey = environment.deepApiKey;// Reemplaza con tu clave API de DeepL
  private apiUrl = environment.deepApiUrl; // URL para la versión gratuita de DeepL

  constructor(private http: HttpClient) {}

  /**
   * Traduce un texto a un idioma objetivo utilizando la API de DeepL.
   * @param text El texto a traducir.
   * @param targetLanguage El idioma objetivo de la traducción (DE, EN, ES, IT, FR).
   * @returns Un Observable con la respuesta de la traducción.
   */
  translateText(text: string, targetLanguage: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `DeepL-Auth-Key ${this.apiKey}`);
    const params = new HttpParams()
      .set('text', text)
      .set('target_lang', targetLanguage);

    return this.http.post(this.apiUrl, params, { headers });
  }
}
