import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.emporiodocerrado.app',
  appName: 'Empório do Cerrado',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
