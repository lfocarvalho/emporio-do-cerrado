// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Base da API para desenvolvimento. Ao testar no dispositivo físico,
  // substitua por seu IP na rede local, ex: 'http://192.168.0.10:8000'
  // Emulador Android (Android Studio): use 10.0.2.2 para alcançar o host
  apiBaseUrl: 'http://10.0.2.2:8000',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
