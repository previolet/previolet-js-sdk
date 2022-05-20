import { $window, $document } from '../globals'
import md5 from 'md5'

class AsyncLocalStorage {
  constructor(namespace) {
    this.namespace = namespace || null
    this.origin = $window.location && $window.location.origin ? md5($window.location.origin).substr(0, 8) : null
  }

  setItem(key, value) {
    return Promise.resolve($window.localStorage.setItem(this._getStorageKey(key), value))
  }

  getItem(key) {
    return Promise.resolve($window.localStorage.getItem(this._getStorageKey(key)))
  }

  removeItem(key) {
    return Promise.resolve($window.localStorage.removeItem(this._getStorageKey(key)))
  }

  _getStorageKey(key) {
    if (this.namespace) {
      return [this.origin, this.namespace, key].join('.')
    }
    return key
  }
}

export default AsyncLocalStorage