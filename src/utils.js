import { $window, $navigator } from './globals'
import axios from 'axios'

export function camelCase(name) {
  return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  })
}

export function getBaseUrl(options, instance) {
  instance = instance || options.instance
  var base_url = options.baseUrl.replace('{{instance}}', instance)
  base_url = base_url.replace('{{region}}', options.region)
  base_url = base_url.replace('{{version}}', options.version)

  return base_url
}

export function getBaseBucketUrl(options, instance, bucket) {
  instance = instance || options.instance
  var base_url = options.baseUrl.replace('{{instance}}', 'log-' + instance + '-' + bucket)
  base_url = base_url.replace('{{region}}', options.region)
  base_url = base_url.replace('{{version}}', options.version)

  return base_url
}

export function generateRandomNumber(from, to) {
  from = from || 100
  to = to || 999

  return Math.floor((Math.random() * to) + from)
}

export function urlSerializeObject(obj, prefix) {
  var str = [], p
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p]
      str.push((v !== null && typeof v === "object") ?
        urlSerializeObject(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v))
    }
  }
  return str.join("&")
}

export function storageEncode(value, encodingType) {
  if (encodingType == 'json') {
    return JSON.stringify(value)
  } else {
    return $window.btoa(unescape(encodeURIComponent(JSON.stringify(value))))
  }
}

export function storageDecode(value, encodingType) {
  if (encodingType == 'json') {
    return JSON.parse(value)
  } else {
    return JSON.parse($window.atob(decodeURIComponent(escape(value))))
  }
}

export function getDisplayMode() {
  let display = 'browser'
  const mqStandAlone = '(display-mode: standalone)'
  if ($navigator.standalone || (typeof $window.matchMedia == 'function' && $window.matchMedia(mqStandAlone).matches)) {
    display = 'standalone'
  }
  return display
}

function performRequest(endpoint, options) {
  options.responseType = 'json'

  let req = axios(endpoint, options)
    .then(ret => {
      return ret.data
    })
    .catch(err => {
      console.log(err)
      throw err
    })

  return req
}

function setAxiosDefaultAdapter(newAdapter) {
  // https://github.com/axios/axios/issues/456
  // https://stackoverflow.com/questions/62194540/how-to-create-http-requests-with-axios-from-within-v8js
  axios.defaults.adapter = newAdapter
}

if (typeof overrideAxiosDefaultAdapter !== 'undefined') {
  setAxiosDefaultAdapter(overrideAxiosDefaultAdapter)
}

export { performRequest, setAxiosDefaultAdapter }