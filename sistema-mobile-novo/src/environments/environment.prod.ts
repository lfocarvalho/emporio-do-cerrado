import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  // Para dispositivo em produção, use o IP do servidor Django
  // Por exemplo: 'http://192.168.1.100:8000' ou 'https://api.emporiodocerrado.com'
  apiBaseUrl: '',
  mediaBaseUrl: ''
};
