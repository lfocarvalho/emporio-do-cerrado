import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { CapacitorHttp } from '@capacitor/core';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storage: Storage | null = null;
  private authState$ = new BehaviorSubject<boolean>(false);
  private currentUser$ = new BehaviorSubject<User | null>(null);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  constructor() {}

  /**
   * Inicializa o Storage (deve ser chamado no APP_INITIALIZER)
   */
  async init(): Promise<void> {
    const storage = new Storage();
    this.storage = await storage.create();
    
    // Verifica se há token armazenado
    const token = await this.getToken();
    if (token) {
      // Tenta obter perfil atualizado do servidor
      try {
        const fresh = await this.fetchRemoteProfile();
        await this.storage?.set(this.USER_KEY, fresh);
        this.authState$.next(true);
        this.currentUser$.next(fresh);
      } catch {
        // Fallback para dados locais
        const user = await this.getUser();
        this.authState$.next(true);
        this.currentUser$.next(user);
      }
    }
  }

  /**
   * Faz login no sistema
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const url = environment.apiBaseUrl 
      ? `${environment.apiBaseUrl}/autenticacao-api/`
      : '/autenticacao-api/';

    try {
      const response = await CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: { username, password }
      });

      if (response.status === 200 && response.data.token) {
        // Normaliza formato (algumas versões antigas poderiam não mandar 'user')
        let user: User | undefined = response.data.user;
        if (!user) {
          user = {
            id: response.data.id,
            username: response.data.username || username,
            email: response.data.email,
            first_name: response.data.first_name || response.data.nome,
            last_name: response.data.last_name || ''
          };
        }
        const loginData: LoginResponse = { token: response.data.token, user };
        
        // Armazena token e dados do usuário
        await this.storage?.set(this.TOKEN_KEY, loginData.token);
        await this.storage?.set(this.USER_KEY, loginData.user);
        
        // Atualiza estado
        this.authState$.next(true);
        this.currentUser$.next(loginData.user);
        // Opcional: refetch para garantir consistência imediata
        try {
          const fresh = await this.fetchRemoteProfile();
          await this.setUserData(fresh);
        } catch {}
        
        return loginData;
      } else {
        throw new Error(response.data?.detail || 'Erro ao fazer login');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }

  /**
   * Faz logout do sistema
   */
  async logout(): Promise<void> {
    await this.storage?.remove(this.TOKEN_KEY);
    await this.storage?.remove(this.USER_KEY);
    this.authState$.next(false);
    this.currentUser$.next(null);
  }

  /**
   * Retorna o token de autenticação
   */
  async getToken(): Promise<string | null> {
    return await this.storage?.get(this.TOKEN_KEY) || null;
  }

  /**
   * Retorna dados do usuário armazenado
   */
  async getUser(): Promise<User | null> {
    return await this.storage?.get(this.USER_KEY) || null;
  }

  /**
   * Verifica se está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Observable do estado de autenticação
   */
  get authState(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  /**
   * Observable do usuário atual
   */
  get currentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Atualiza os dados do usuário armazenado após edição
   */
  async setUserData(updated: User): Promise<void> {
    await this.storage?.set(this.USER_KEY, updated);
    this.currentUser$.next(updated);
  }

  /** Obtém perfil remoto atual usando ApiService */
  private async fetchRemoteProfile(): Promise<User> {
    const api = inject(ApiService);
    const data = await api.get<User>('/perfil/api/');
    return data;
  }
}
