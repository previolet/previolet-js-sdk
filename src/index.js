import { getBaseUrl, generateRandomNumber, storageDecode, storageEncode, setAxiosDefaultAdapter, performRequest } from './utils'
import fetchAdapter from './fetchAdapter'
import { $window, $navigator } from './globals'
import defaultOptions from './options'
import apiErrors from './errors'
import StorageFactory from './storage'
import DatabaseApi from './apis/database'
import FunctionsApi from './apis/functions'
import StorageApi from './apis/storage'
import RemoteConfig from './apis/remote-config'
import Bucket from './apis/bucket'
import Trace from './apis/trace'
import packageData from '../package.json'

export default class PrevioletSDK {
	constructor (overrideOptions) {
    const vm = this

    let options = Object.assign({}, defaultOptions, overrideOptions)
    if (options.debug) {
      console.log(`%cPreviolet Javascript SDK (v${packageData.version}) instantiated in debug mode`, 'color: #CC00FF')
    }

    if (options.instance && 
        options.instance == '<%= previolet.options.instance %>' && 
        options.fallback && 
        options.fallback.instance) {
      if (options.debug) {
        console.log('Using fallback instance', options.fallback.instance)
      }

      options.instance = options.fallback.instance
    }

    if (options.tokenFallback && options.tokenOverride) {
      throw 'Cannot define both tokenFallback and tokenOverride'
    }

    if (options.tokenFallback && options.tokenFallback == '<%= previolet.token.guest %>') {
      if (options.fallback && options.fallback.tokenFallback) {
        if (options.debug) {
          console.log('Using fallback tokenFallback', options.fallback.tokenFallback)
        }

        options.tokenFallback = options.fallback.tokenFallback
      } else {
        if (options.debug) {
          console.log('No fallback tokenFallback provided, defaulting to false')
        }

        options.tokenFallback = false
      }
    }

    if (options.tokenOverride && options.tokenOverride == '<%= previolet.token.guest %>') {
      if (options.fallback && options.fallback.tokenOverride) {
        if (options.debug) {
          console.log('Using fallback tokenOverride', options.fallback.tokenOverride)
        }

        options.tokenOverride = options.fallback.tokenOverride
      } else {
        if (options.debug) {
          console.log('No fallback tokenOverride provided, defaulting to false')
        }

        options.tokenOverride = false
      }
    }

    if (options.requestAdapterName == 'fetch') {
      if (options.debug) {
        console.log('Switching to fetch axios adapter')
      }

      setAxiosDefaultAdapter(fetchAdapter)
    }

    if (null !== options.xhrAdapter) {
      if (options.debug) {
        console.log('Switching to custom axios adapter')
      }

      setAxiosDefaultAdapter(options.xhrAdapter)
    }

    let token = false
    let currentApp = null
    let currentUser = null
    let last_access_token = null
    let headers = {}
    this.changeHooks = []

    this.onAuthDataCallback = (data) => {
      return data
    }

    this.storageApi = StorageFactory(options)

    this.auth = () => {
      return {
        GithubAuthProvider: {
          id: 'github',
        },

        GoogleAuthProvider: {
          id: 'google',
        },

        FacebookAuthProvider: {
          id: 'facebook',
        },

        logout: (params) => {
          if (! vm.auth().isAuthenticated()) {
            if (this.options.debug) console.log('There is no authenticated user')
            return false
          }

          params = params || {}
          params.preventUserStatePropagation = params.preventUserStatePropagation || false

          const data = JSON.stringify({
            token: vm.token
          })

          const options = {
            method: 'DELETE',
            data
          }

          if (vm.options.debug) console.log('Logging Out')

          // Remove token from storage
          vm.token = false

          // Remove user data
          vm.currentUser = null

          vm.storageApi.removeItem(vm.options.tokenName)
          vm.storageApi.removeItem(vm.options.applicationStorage)
          vm.storageApi.removeItem(vm.options.userStorage)

          if (! params.preventUserStatePropagation) {
            vm.__propagateUserState(false)
          }

          return vm.__call('/__/token', options, 'token').then(ret => {
            return ret
          })
        },

        loginWithUsernameAndPassword: (name, challenge) => {
          if (! name) {
            return Promise.reject(new Error('username required'))
          }

          if (! challenge) {
            return Promise.reject(new Error('password required'))
          }

          if (vm.options.debug) {
            console.log('Logging In with username and password', name, challenge)
          }

          const data = JSON.stringify({
            name,
            challenge,
            expire: vm.options.userTokenExpiration,
          })

          const options = {
            method: 'POST',
            data,
          }

          return vm.__call('/__/auth', options).then(ret => {
            vm.__checkError(vm, ret)

            if (ret && ret.result && ret.result.emailSent) {
              // we only sent a login with pin request, nothing else to do
              return ret.result
            }

            ret = vm.onAuthDataCallback(ret)
            vm.__loadAuthenticationDataFromResponse(ret)

            if (null !== vm.currentUser) {
              vm.__propagateUserState(vm.currentUser)
            }

            return ret.result.data
          })
        },

        loginWithIdentityProvider: (provider, access_token) => {
          access_token = access_token || this.last_access_token
          this.last_access_token = access_token

          if (this.options.debug) {
            console.log('Logging In with identity provider:', provider, access_token)
          }

          const params = {
            access_token,
          }

          const options = {
            method: 'POST',
            params,
          }

          return this.__call('/__/auth/identity/' + provider, options).then(ret => {
            this.__checkError(vm, ret)

            if (! ret.result) {
              vm.__propagateUserState(false)
            } else if (ret.result) {
              if (ret.result.token && ret.result.auth) {
                ret = vm.onAuthDataCallback(ret)
                vm.__loadAuthenticationDataFromResponse(ret)
                vm.__propagateUserState(ret.result.auth)
              } else {
                vm.__propagateUserState(false)
              }
            }

            return ret.result
          })
        },

        loginWithUsernameAndPin: (name, challenge) => {
          return vm.auth().loginWithUsernameAndPassword(name, '_pin:' + challenge)
        },

        sendLoginPin: (name) => {
          return vm.auth().loginWithUsernameAndPassword(name, '_sendEmailPin')
        },

        forgotPassword: (name, params) => {
          if (! name) {
            return Promise.reject(new Error('username required'))
          }

          let origin = params && params.origin ? params.origin : $window.location.origin
          let skip_email = params && params.skip_email ? params.skip_email : false

          const data = JSON.stringify({
            name,
            origin,
            skip_email,
          })

          const options = {
            method: 'POST',
            data,
          }

          return vm.__call('/__/auth/reset', options).then(ret => {
            vm.__checkError(vm, ret)
            return ret.result
          })
        },

        forgotPasswordConfirmation: (challenge, confirm_challenge, hash) => {
          if (! challenge) {
            return Promise.reject(new Error('challenge required'))
          }

          if (! confirm_challenge) {
            return Promise.reject(new Error('confirm_challenge required'))
          }

          if (! hash) {
            return Promise.reject(new Error('hash required'))
          }

          const data = JSON.stringify({
            challenge,
            confirm_challenge,
            hash,
          })

          const options = {
            method: 'POST',
            data,
          }

          return vm.__call('/__/auth/reset/confirm', options).then(ret => {
            vm.__checkError(vm, ret)
            return ret.result
          })
        },

        registerWithIdentityProvider: (provider, email, access_token, trigger_login) => {
          access_token = access_token || this.last_access_token
          trigger_login = trigger_login || true
          this.last_access_token = access_token

          const data = {
            access_token,
            email,
            role: 'admin'
          }

          const options = {
            method: 'POST',
            data,
          }

          return this.__call('/__/auth/identity/' + provider + '/register', options).then(ret => {
            this.__checkError(vm, ret)

            if (trigger_login) {
              return this.loginWithIdentityProvider(provider, access_token)
            } else {
              return ret
            }
          })
        },

        isAuthenticated: () => {
          let token = vm.token

          if (token) {
            return true
          } else {
            return false
          }
        },

        loginAsGuest: () => {
          const data = JSON.stringify({
            expire: vm.options.guestTokenExpiration
          })

          const options = {
            method: 'POST',
            data
          }

          return vm.__call('/__/auth/guest', options).then(ret => {
            if (ret.error_code) {
              vm.auth().logout()
              return
            }

            ret = vm.onAuthDataCallback(ret)
            vm.__loadAuthenticationDataFromResponse(ret)

            if (null !== vm.currentUser) {
              vm.__propagateUserState(vm.currentUser)
            }

            return ret.result.data
          })
        },

        onAuthStateChanged: (callback) => {
          if (typeof callback == 'function') {

            if (vm.changeHooks.indexOf(callback) == -1) {
              if (vm.options.debug) {
                console.log('Registered callback function: onAuthStateChanged', callback)
              }

              vm.changeHooks.push(callback)
            } else {
              if (vm.options.debug) {
                console.log('Callback function onAuthStateChanged is already registered', callback)
              }
            }

            let current_user = vm.currentUser
            let current_token = vm.token

            if (vm.options.debug) {
              if (current_user && current_token) {
                console.log('User is logged in', current_user)
              } else {
                console.log('User is not logged in')
              }
            }

            return current_token && current_user ? callback(current_user) : callback(false)
          } else {
            if (vm.options.debug) {
              console.log('User is not logged in')
            }

            return false
          }
        },

        onAuthData: (callback) => {
          if (typeof callback == 'function') {
            vm.onAuthDataCallback = callback

            if (vm.options.debug) {
              console.log('Replacing onAuthData callback with custom one', callback)
            }
          }
        },

        getToken: () => {
          return this.db().__getTokenToUse()
        },

        getCurrentUser: () => {
          return this.currentUser
        }
      }
    }

    Object.defineProperties(this, {
      options: {
        get() {
          return options
        },
        set(value) {
          options = value
        }
      },

      token: {
        get() {
          return token
        },
        set(value) {
          if (value == token) {
            return
          }

          token = value
          vm.storageApi.setItem(options.tokenName, token)
        }
      },

      headers: {
        get() {
          return headers
        }
      },

      currentApp: {
        get() {
          return currentApp
        },
        set(value) {
          currentApp = value
          vm.storageApi.setItem(options.applicationStorage, storageEncode(value, options.localStorageEncode))
        }
      },

      currentUser: {
        get() {
          return currentUser
        },
        set(value) {
          currentUser = value

          if (this.options.debug) {
            console.log('Setting current user information:', value)
          }

          vm.storageApi.setItem(options.userStorage, storageEncode(value, options.localStorageEncode))
        }
      },

      browserIdentification: {
        get() {
          return vm.__storageGet(vm.options.browserIdentification)
        },
        set(value) {
          value.ts = value.ts || Date.now()
          value.rnd = value.rnd || generateRandomNumber(100000, 999999)
          vm.storageApi.setItem(options.browserIdentification, storageEncode(value, options.localStorageEncode))
        }
      },

      displayMode: {
        get() {
          let display = 'browser'
          const mqStandAlone = '(display-mode: standalone)'
          if ($navigator.standalone || (typeof $window.matchMedia == 'function' && $window.matchMedia(mqStandAlone).matches)) {
            display = 'standalone'
          }
          return display
        }
      }
    })

    vm.app = () => {
      return {
        region: vm.options.region,
        token: vm.storageApi.getItem(vm.options.tokenName) || false,
        data: vm.__storageGet(vm.options.applicationStorage),
      }
    }

    let _stored_token = vm.app().token
    vm.token = _stored_token

    // Include display mode in the identification

    let baseline_identification = {
        ua: $navigator.userAgent,
      lang: $navigator.language || $navigator.userLanguage,
      plat: $navigator.platform,
      vsdk: vm.options.sdkVersion,
      vapp: vm.options.appVersion,
       ver: vm.options.version,
      dspm: vm.displayMode,
    }

    if (typeof __previoletRayId !== 'undefined') {
      baseline_identification.ray = __previoletRayId
    }

    // Handle browser identification
    if (! vm.browserIdentification) {
      vm.browserIdentification = { ...baseline_identification }

      if (vm.options.debug) {
        console.log('Generating browser identification', vm.browserIdentification)
      }
    } else {
      // Check if anything changed and if so, update the identification
      if (vm.options.debug) {
        console.log('Browser identification exists', vm.browserIdentification)
      }

      let match = {
          ...baseline_identification,
          ts: vm.browserIdentification.ts,
         rnd: vm.browserIdentification.rnd,
      }

      if (JSON.stringify(match) != JSON.stringify(vm.browserIdentification)) {
        if (vm.options.debug) {
          console.log('Browser identification changed, renewing', match)
        }

        vm.browserIdentification = match
      }
    }

    let __db = new DatabaseApi(vm).addToErrorChain(vm, vm.__checkError)
    vm.db = () => {
      return __db
    }

    let __functions = new FunctionsApi(vm).addToErrorChain(vm, vm.__checkError)
    vm.functions = () => {
      return __functions
    }

    let __storage = new StorageApi(vm).addToErrorChain(vm, vm.__checkError)
    vm.storage = () => {
      return __storage
    }

    let __remoteConfig = new RemoteConfig(vm).addToErrorChain(vm, vm.__checkError)
    vm.remoteConfig = () => {
      return __remoteConfig
    }

    let __bucket = new Bucket(vm).addToErrorChain(vm, vm.__checkError)
    vm.bucket = () => {
      return __bucket
    }

    let __trace = new Trace(vm).addToErrorChain(vm, vm.__checkError)
    vm.trace = () => {
      return __trace
    }

    vm.user = () => {
      return {
        data: vm.__storageGet(vm.options.userStorage),
      }
    }

    vm.version = () => {
      return vm.options.sdkVersion
    }

    vm.currentUser = vm.user().data
  }

  getDefaultHeaders() {
    return Object.assign({}, this.headers, {})
  }

  getRemoteConfig() {
    const vm = this

    return this.functions().getRemoteConfig().then(config => {
      if (typeof config == 'object') {
        let merge = vm.options.defaultConfig
        Object.keys(config).forEach(key => {
          merge[key] = config[key]
        })

        return merge
      } else {
        return vm.options.defaultConfig
      }
    })
  }

  updateOptions(overrideOptions) {
    const vm = this
    vm.options = Object.assign({}, vm.options, overrideOptions)

    if (vm.options.debug) {
      console.log('Updated SDK Options', vm.options)
    }
  }

  __propagateUserState(userState) {
    const vm = this

    vm.changeHooks.forEach(func => {
      if (vm.options.debug) {
        console.log('Triggering onAuthStateChanged callback', userState)
      }

      func(userState)
    })
  }

  __loadAuthenticationDataFromResponse(ret) {
    if (ret.result.token) {
      if (this.options.debug) {
        console.log('Saving token', ret.result.token)
      }

      this.token = ret.result.token
    }

    if (ret.result.auth) {
      if (this.options.debug) {
        console.log('Saving user details', ret.result.auth)
      }

      this.currentUser = ret.result.auth
    } else {
      if (this.options.debug) {
        console.log('Saving default guest details')
      }

      this.currentUser = {
        name: 'Guest',
        username: 'guest',
        guest: true,
      }
    }

    if (ret.result.data) {
      if (ret.result.data[this.options.instance] && ret.result.data[this.options.instance].instance_data) {
        this.currentApp = ret.result.data[this.options.instance].instance_data

        if (this.options.debug) {
          console.log('Saving application details', this.currentApp)
        }
      } else {
        if (this.options.debug) {
          console.log('Application details not available')
        }
      }
    }
  }

  __storageGet(key) {
    const vm = this

    let _storage = vm.storageApi.getItem(key)
    let _storage_data = false

    if (_storage) {
      try {
        _storage_data = storageDecode(_storage, vm.options.localStorageEncode)
      } catch (e) {
      }
    }

    return _storage_data
  }

  __checkError (context, response) {
    if (response.error) {
      if (context.options.debug) {
        console.log('%cBackend error details', 'color: #FF3333', response)
      }

      let logout_on_errors = [
        apiErrors.NO_TOKEN,
        apiErrors.TOKEN_DOESNT_MATCH_INSTANCE,
        apiErrors.TOKEN_EXPIRED,
        apiErrors.INVALID_TOKEN,
      ]

      if (response.error_code && logout_on_errors.indexOf(parseInt(response.error_code)) != -1) {
        // If the user was logged in as guest, get another token
        if (context.user().data.guest) {
          context.auth().loginAsGuest()
        } else {
          context.auth().logout()
        }
      }

      throw response
    }
  }

  __call(url, options, instance) {
    instance = instance || this.options.instance
    options = options || {}
    options.headers = this.getDefaultHeaders()

    let req_id = this.options.reqIndex ++
    let endpoint = getBaseUrl(this.options, instance) + url

    if (this.options.debug) {
      console.log(`> Request (${req_id})`, endpoint, options)
    }

    return performRequest(endpoint, options)
  }
}

$window.PrevioletSDK = PrevioletSDK

/*
// UMD (Universal Module Definition)
// https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.PrevioletSDK = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return PrevioletSDK;
}))
*/
