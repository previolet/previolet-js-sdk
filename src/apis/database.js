import Base from './base'
import { urlSerializeObject } from '../utils'

export default class Database extends Base {
  constructor(sdk) {
    super(sdk)
    this.currentDatabase = null
  }

  getAll() {
    const options = {
      method: 'GET',
    }

    return this.__call('/__/index', options).then(ret => {
      this.__checkError(this, ret)
      return ret && ret.result && ret.result.objects ? ret.result.objects : []
    })
  }

  select(database) {
    this.currentDatabase = database
    return this
  }

  add(data) {
    data = data || {}

    const options = {
      method: 'POST',
      data,
    }

    return this.__callDatabase(options).then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : ret
    })
  }

  getRaw(params, fieldProjection) {
    let append = ''
    params = params || {}

    if (fieldProjection) {
      append = '?' + urlSerializeObject(fieldProjection, '_fields')
    }

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options, append).then(ret => {
      this.__checkError(this, ret)
      return ret
    })
  }

  get(params, fieldProjection) {
    return this.getRaw(params, fieldProjection).then(ret => {
      return ret.result ? ret.result : []
    })
  }

  getOne(params) {
    params = params || {}
    params._limit = 1

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options).then(ret => {
      this.__checkError(this, ret)
      return ret.result && ret.result[0] ? ret.result[0] : false
    })
  }

  getCount(params) {
    params = params || {}

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options, '/count').then(ret => {
      this.__checkError(this, ret)
      return ret.result ? parseInt(ret.result) : 0
    })
  }

  update(id, data) {
    data = data || {}

    const options = {
      method: 'PUT',
      data,
    }

    return this.__callDatabase(options, '/' + id).then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : ret
    })
  }

  updateByFieldValue(field, value, data) {
    data = data || {}

    const options = {
      method: 'PUT',
      data,
    }

    return this.__callDatabase(options, '/' + encodeURIComponent(field) + '/' + encodeURIComponent(value)).then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : ret
    })
  }

  delete(id) {
    const options = {
      method: 'DELETE',
    }

    return this.__callDatabase(options, '/' + id).then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : ret
    })
  }

  deleteByFieldValue(field, value) {
    const options = {
      method: 'DELETE',
    }

    return this.__callDatabase(options, '/' + encodeURIComponent(field) + '/' + encodeURIComponent(value)).then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : ret
    })
  }

  fieldExists(name) {
    // Implementation to follow
  }

  addField(params) {
    // Implementation to follow
  }

  getFields(params) {
    params = params || {}

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options, '/structure/fields').then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : []
    })
  }

  getStructure(params) {
    params = params || {}

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options, '/structure').then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : []
    })
  }

  getFilters(params) {
    params = params || {}

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options, '/structure/filters').then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : []
    })
  }

  getViews(params) {
    params = params || {}

    const options = {
      method: 'GET',
      params,
    }

    return this.__callDatabase(options, '/structure/views').then(ret => {
      this.__checkError(this, ret)
      return ret.result ? ret.result : []
    })
  }

  getDistinct(field, params) {
    // Implementation to follow
  }

  getDistinctCount(field, params) {
    // Implementation to follow
  }

  async *iterator(params, fieldProjection) {
    let response
    let _offset = 0
    let _limit  = 10

    do {
      response = await this.get({ ...params, _offset, _limit }, fieldProjection)
      for (const res of response) {
        yield res
      }
      _offset += _limit
      await this.__sleep(1000)
    } while (response.length == _limit)
  }

  __callDatabase(options, append) {
    append = append || ''

    if (null === this.currentDatabase) {
      return Promise.reject(new Error('Please select a database'))
    }

    return this.__call('/' + this.currentDatabase + append, options)
  }
}
