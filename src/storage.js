import { $window } from './globals'
import LocalStorage from './storage/local-storage'
import AsyncLocalStorage from './storage/async-local-storage'

export default function StorageFactory(options) {
  if (null !== options.localStorageObject) {
    return options.localStorageObject
  }

  if (options.debug && options.localStorageAsync) {
    console.log('Using AsyncLocalStorage')
  }

  switch (options.storageType) {
    case 'localStorage':
      try {
        $window.localStorage.setItem('testKey', 'test')
        $window.localStorage.removeItem('testKey')
        return options.localStorageAsync ? new AsyncLocalStorage(options.storageNamespace) : new LocalStorage(options.storageNamespace)
      } catch(e) {}

    default:
      return options.localStorageAsync ? new AsyncLocalStorage(options.storageNamespace) : new LocalStorage(options.storageNamespace)
      break;
  }
}
