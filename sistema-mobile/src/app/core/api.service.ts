import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions, HttpResponse, Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

function resolveBase(): string {
  let configured = environment.apiBaseUrl?.replace(/\/$/, '') || '';
  // Se estiver no browser e configurado para 10.0.2.2, usar localhost
  try {
    const platform = Capacitor.getPlatform();
    if (platform === 'web' && /10\.0\.2\.2/.test(configured)) {
      configured = 'http://localhost:8000';
    }
  } catch {}
  return configured;
}

function buildUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = resolveBase();
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private auth: AuthService) {}

  getBase(): string { return resolveBase(); }

  private async options(url: string, opts?: Partial<HttpOptions>, auth: boolean = true): Promise<HttpOptions> {
    const headers: Record<string, string> = Object.assign({}, opts?.headers);
    if (auth) {
      const token = await this.auth.getToken();
      if (token) headers['Authorization'] = `Token ${token}`;
    }
    return { ...(opts || {}), url: buildUrl(url), headers } as HttpOptions;
  }

  async get(url: string, opts?: Partial<HttpOptions>, auth = true): Promise<HttpResponse> {
    const o = await this.options(url, opts, auth);
    console.log('[ApiService] GET', o.url, auth ? '(auth)' : '(no-auth)', 'headers:', o.headers);
    return CapacitorHttp.get(o);
  }

  async post(url: string, data?: any, opts?: Partial<HttpOptions>, auth = true): Promise<HttpResponse> {
    const o = await this.options(url, { ...(opts || {}), data, headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) } }, auth);
    console.log('[ApiService] POST', o.url, auth ? '(auth)' : '(no-auth)', 'headers:', o.headers, 'body:', data);
    return CapacitorHttp.post(o);
  }
}
