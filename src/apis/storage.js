import { getBaseUrl } from '../utils'
import Base from './base'

export default class Storage extends Base {
  constructor(sdk) {
    super(sdk)
  }

  getAll() {
    const options = {
      method: 'GET',
    }

    return this.__call('/__/storage', options).then(ret => ret.result)
  }

  getUploadUrl() {
    return getBaseUrl(this.sdk.options) + '/__/storage?token=' + this.__getTokenToUse()
  }

  includeToken (url, options) {
    let resize = options && options.resize

    if (url && url.indexOf('__/storage/static/') != -1) {
      if (resize) {
        url = url.replace('__/storage/static/', '__/storage/static/w_250/')
      }

      url = url.indexOf('?') == -1 ? url + '?token=' + this.__getTokenToUse() : url + '&token=' + this.__getTokenToUse()
    }

    return url
  }

}
