import { Injectable, inject } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ApiRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, string>;
  data?: any;
  headers?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private authService = inject(AuthService);

  /**
   * Resolve a URL completa, adicionando baseUrl quando necessário
   */
  private resolveUrl(path: string): string {
    // Se já for URL completa, retorna direto
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Em desenvolvimento web (browser), não usa baseUrl - o proxy resolve
    // Em dispositivo, usa o baseUrl do environment
    const base = environment.apiBaseUrl || '';
    
    // Remove barra duplicada se houver
    if (base.endsWith('/') && path.startsWith('/')) {
      return base + path.substring(1);
    }
    
    return base + path;
  }

  /**
   * Método genérico para fazer requisições HTTP
   */
  async request<T>(options: ApiRequestOptions): Promise<T> {
    const token = await this.authService.getToken() as string | null;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Adiciona token se estiver autenticado
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const url = this.resolveUrl(options.url);
    console.log('API Request:', options.method || 'GET', url, options.params);

    try {
      const response: HttpResponse = await CapacitorHttp.request({
        url,
        method: options.method || 'GET',
        headers,
        params: options.params,
        data: options.data
      });

      console.log('API Response:', response.status, response.data);

      if (response.status >= 200 && response.status < 300) {
        return response.data as T;
      } else {
        throw new Error(`HTTP Error ${response.status}: ${response.data?.detail || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Métodos de conveniência
   */
  get<T>(url: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>({ url, method: 'GET', params });
  }

  post<T>(url: string, data: any): Promise<T> {
    return this.request<T>({ url, method: 'POST', data });
  }

  put<T>(url: string, data: any): Promise<T> {
    return this.request<T>({ url, method: 'PUT', data });
  }

  delete<T>(url: string): Promise<T> {
    return this.request<T>({ url, method: 'DELETE' });
  }

  patch<T>(url: string, data: any): Promise<T> {
    return this.request<T>({ url, method: 'PATCH', data });
  }
}
