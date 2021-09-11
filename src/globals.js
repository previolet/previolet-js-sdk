const fakeLocalStorageMap = { }
const fakeSessionStorageMap = { }

const fakeDocument = {
  createElement() { },
}

const fakeWindow = {
  btoa(a) { return a },
  atob(a) { return a },
  setInterval() { },
  open() { },
  location: {
    origin: '',
  },
  localStorage: {
    setItem(key, value) { fakeLocalStorageMap[key] = value },
    getItem(key) { return fakeLocalStorageMap[key] },
    removeItem(key) { delete fakeLocalStorageMap[key] },
  },
  sessionStorage: {
    setItem(key, value) { fakeSessionStorageMap[key] = value },
    getItem(key) { return fakeSessionStorageMap[key] },
    removeItem(key) { delete fakeSessionStorageMap[key] },
  },
  isFakeWindow: true,
}

const fakeNavigator = {
  userAgent: null,
  userLanguage: null,
  language: null,
  platform: typeof __previoletNamespace !== 'undefined' ? 'psdk:' + __previoletNamespace : null,
  standalone: false,
}

export const $document = typeof document !== 'undefined' ? document : fakeDocument
export const $window = typeof window !== 'undefined' && typeof window.btoa == 'function' && typeof window.atob == 'function' ? window : fakeWindow
export const $navigator = typeof navigator !== 'undefined' ? navigator : fakeNavigator
