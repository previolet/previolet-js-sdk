import { $window } from './globals'
import LocalStorage from './storage/local-storage'

export default function StorageFactory(options) {
  if (null !== options.localStorageObject) {
    return options.localStorageObject
  }

  switch (options.storageType) {
    case 'localStorage':
      try {
        $window.localStorage.setItem('testKey', 'test')
        $window.localStorage.removeItem('testKey')
        return new LocalStorage(options.storageNamespace)
      } catch(e) {}

    default:
      return new LocalStorage(options.storageNamespace)
      break;
  }
}
