import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  id?: number;
  username?: string;
  token?: string;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageReady = false;
  private usuarioCache?: Usuario | null;
  private authState$ = new BehaviorSubject<boolean>(false);

  constructor(private storage: Storage) {}

  private async ensureStorage() {
    if (!this.storageReady) {
      await this.storage.create();
      this.storageReady = true;
    }
  }

  async getUsuario(): Promise<Usuario | null> {
    await this.ensureStorage();
    if (this.usuarioCache === undefined) {
      this.usuarioCache = await this.storage.get('usuario');
    }
    return this.usuarioCache ?? null;
  }

  async getToken(): Promise<string | undefined> {
    const usuario = await this.getUsuario();
    return usuario?.token;
  }

  async isAuthenticated(): Promise<boolean> {
    const t = await this.getToken();
    return !!t;
  }

  isAuthenticatedStream(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  async login(username: string, password: string): Promise<Usuario> {
    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: `${environment.apiBaseUrl}/autenticacao-api/`,
      data: { username, password },
    };
    const resp: HttpResponse = await CapacitorHttp.post(options);
    if (resp.status !== 200) {
      throw Object.assign(new Error('Falha na autenticação'), { status: resp.status, data: resp.data });
    }
    const usuario: Usuario = resp.data as any;
    await this.ensureStorage();
    await this.storage.set('usuario', usuario);
    this.usuarioCache = usuario;
    this.authState$.next(true);
    return usuario;
  }

  async logout(): Promise<void> {
    await this.ensureStorage();
    await this.storage.remove('usuario');
    this.usuarioCache = null;
    this.authState$.next(false);
  }
}
