import { getBaseUrl } from '../utils'
import Base from './base'

export default class Storage extends Base {
  constructor(sdk) {
    super(sdk)
  }

  upload(data) {
    data = data || {}

    const options = {
      method: 'POST',
      data,
    }

    return this.__call('/__/storage', options).then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : ret;
    })
  }

  uploadBase64(file_name, file_base64) {
    return this.upload({
      file_name,
      file_base64,
    })
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

      if (url.indexOf('?token=') == -1 && url.indexOf('&token=') == -1) {
        url = url.indexOf('?') == -1 ? url + '?token=' + this.__getTokenToUse() : url + '&token=' + this.__getTokenToUse()
      }
    }

    return url
  }

}
