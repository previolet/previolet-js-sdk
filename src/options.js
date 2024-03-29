export default {
  baseUrl: 'https://{{instance}}.{{region}}.previolet.com/{{version}}',
  region: 'eu.west1',
  version: 'v1',
  guestTokenExpiration: 3600, // in seconds
  userTokenExpiration: 86400 * 10, // 10 days
  storageType: 'localStorage',
  storageNamespace: 'previolet-sdk',
  tokenName: 'token',
  applicationStorage: 'app',
  browserIdentification: 'bid',
  userStorage: 'user',
  debug: false,
  reqIndex: 1,
  sdkVersion: '__SDK_VERSION__',
  appVersion: '-',
  defaultConfig: {},
  tokenOverride: false,
  xhrAdapter: null,
  requestAdapterName: null,
  tokenFallback: false,
  localStorageObject: null,
  localStorageEncode: 'complex',
}
