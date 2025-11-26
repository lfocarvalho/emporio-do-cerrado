export interface Environment {
  production: boolean;
  apiBaseUrl: string; // usado para XHR via proxy ou base de API
  mediaBaseUrl?: string; // base para imagens/arquivos estáticos (ex: http://localhost:8000)
}
