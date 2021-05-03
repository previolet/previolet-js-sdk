import axios from 'axios'

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
}

const fakeNavigator = {
  userAgent: null,
  userLanguage: null,
  language: null,
  platform: typeof __previoletNamespace !== 'undefined' ? 'psdk:' + __previoletNamespace : null,
}

export const $document = typeof document !== 'undefined' ? document : fakeDocument
export const $window = typeof window !== 'undefined' ? window : fakeWindow
export const $navigator = typeof navigator !== 'undefined' ? navigator : fakeNavigator

const $axios = axios

function setAxiosDefaultAdapter(newAdapter) {
  // https://github.com/axios/axios/issues/456
  // https://stackoverflow.com/questions/62194540/how-to-create-http-requests-with-axios-from-within-v8js
  $axios.defaults.adapter = newAdapter
}

if (typeof overrideAxiosDefaultAdapter !== 'undefined') {
  setAxiosDefaultAdapter(overrideAxiosDefaultAdapter)
}

export { $axios, setAxiosDefaultAdapter }
