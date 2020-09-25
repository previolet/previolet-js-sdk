/**
 * Previolet Javascript SDK v1.0.8
 * https://github.com/previolet/previolet-js-sdk
 * Released under the MIT License.
 */

function e(e,t){t=t||e.instance;var o=e.baseUrl.replace("{{instance}}",t);return o=o.replace("{{region}}",e.region)}var t={baseUrl:"https://{{instance}}.{{region}}.previolet.com/v1",region:"eu.west1",guestTokenExpiration:3600,userTokenExpiration:864e3,storageType:"localStorage",storageNamespace:"previolet-sdk",tokenName:"token",applicationStorage:"app",browserIdentification:"bid",userStorage:"user",debug:!1,reqIndex:1,sdkVersion:"1.0.8",appVersion:"-",defaultConfig:{},tokenOverride:!1,tokenFallback:!1},o=2,r=3;const n=void 0!==typeof window?window:{atob(){},open(){},location:{},localStorage:{setItem(){},getItem(){},removeItem(){}},sessionStorage:{setItem(){},getItem(){},removeItem(){}}};class s{constructor(e){this.namespace=e||null}setItem(e,t){n.localStorage.setItem(this._getStorageKey(e),t)}getItem(e){return n.localStorage.getItem(this._getStorageKey(e))}removeItem(e){n.localStorage.removeItem(this._getStorageKey(e))}_getStorageKey(e){return this.namespace?[this.namespace,e].join("."):e}}class i{constructor(e){this.sdk=e,this.errorChain=[]}addToErrorChain(e,t){return"function"==typeof t?(this.errorChain.push({context:e,func:t}),this.sdk.options.debug&&console.log("Added function to error chain",e,t)):this.sdk.options.debug&&console.log("Cannot add function to error chain, not a function",e,t),this}__getTokenToUse(){var e=null;return this.sdk.token&&(this.sdk.options.debug&&console.log("Using stored token",this.sdk.token),e=this.sdk.token),!e&&this.sdk.options.tokenFallback&&(this.sdk.options.debug&&console.log("Token is now the fallback option",this.sdk.options.tokenFallback),e=this.sdk.options.tokenFallback),this.sdk.options.tokenOverride&&(this.sdk.options.debug&&console.log("Token is now the override option",this.sdk.options.tokenOverride),e=this.sdk.options.tokenOverride),e}__call(t,o){var r=this.__getTokenToUse(),n=this.sdk.browserIdentification;this.sdk.options.debug&&console.log("Using Identification",n),o.headers=Object.assign({},{Authorization:r,Identification:btoa(JSON.stringify(n))});var s=e(this.sdk.options)+t,i=this.sdk.options.reqIndex++;return this.sdk.options.debug&&console.log("> XHR Request ("+i+", "+r+"): ",s,o),axios(s,o).then(e=>(this.sdk.options.debug&&console.log("< XHR Response ("+i+")",e),e.data)).catch(e=>{throw e})}__call_log(e,t){var o=function(e,t,o){t=t||e.instance;var r=e.baseUrl.replace("{{instance}}","log-"+t+"-"+o);return r=r.replace("{{region}}",e.region)}(this.sdk.options,null,e).replace("/v1","/"),r=this.sdk.options.reqIndex++;return this.sdk.options.debug&&console.log("> XHR Bucket Request ("+r+"): ",o),axios(o,t).catch(e=>{throw e})}__checkError(e,t){if(t.error){if(!this.errorChain.length)throw this.sdk.options.debug&&console.log("%cBackend error details","color: #FF3333",t),t;this.errorChain.forEach(e=>{e.func&&"function"==typeof e.func&&(this.sdk.options.debug&&console.log("Propagating error",t),e.func(e.context,t))})}}}class a extends i{constructor(e){super(e),this.currentDatabase=null}getAll(){return this.__call("/__/index",{method:"GET"}).then(e=>(this.__checkError(this,e),e.result.objects))}select(e){return this.currentDatabase=e,this}add(e){const t={method:"POST",data:e=e||{}};return this.__callDatabase(t).then(e=>(this.__checkError(this,e),e.result?e.result:e))}get(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t).then(e=>(this.__checkError(this,e),e.result?e.result:[]))}getOne(e){(e=e||{})._limit=1;const t={method:"GET",params:e};return this.__callDatabase(t).then(e=>(this.__checkError(this,e),!(!e.result||!e.result[0])&&e.result[0]))}getCount(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t,"/count").then(e=>(this.__checkError(this,e),e.result?parseInt(e.result):0))}update(e,t){const o={method:"PUT",data:t=t||{}};return this.__callDatabase(o,"/"+e).then(e=>(this.__checkError(this,e),e.result?e.result:e))}delete(e){return this.__callDatabase({method:"DELETE"},"/"+e).then(e=>(this.__checkError(this,e),e.result?e.result:e))}fieldExists(e){}addField(e){}getFields(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t,"/structure/fields").then(e=>(this.__checkError(this,e),e.result?e.result:[]))}getFilters(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t,"/structure/filters").then(e=>(this.__checkError(this,e),e.result?e.result:[]))}getViews(e){const t={method:"GET",params:e=e||{}};return this.__callDatabase(t,"/structure/views").then(e=>(this.__checkError(this,e),e.result?e.result:[]))}getDistinct(e,t){}getDistinctCount(e,t){}__callDatabase(e,t){return t=t||"",null===this.currentDatabase?Promise.reject(new Error("Please select a database")):this.__call("/"+this.currentDatabase+t,e)}}class c extends i{constructor(e){super(e)}getAll(){return this.__call("/__/function",{method:"GET"}).then(e=>e.result)}run(e,t){const o={method:"POST",data:t=t||!1};return this.__call("/__/function/"+e,o).then(e=>e.result?e.result:e)}getFunctionIdUrl(t){return e(this.sdk.options)+"/__/function/"+t+"?token="+this.__getTokenToUse()}}class u extends i{constructor(e){super(e)}getAll(){return this.__call("/__/storage",{method:"GET"}).then(e=>e.result)}getUploadUrl(){return e(this.sdk.options)+"/__/storage?token="+this.__getTokenToUse()}}class l extends i{constructor(e){super(e)}get(){const e=this;return this.__call("/__/remote-config",{method:"GET"}).then(t=>{if("object"==typeof t){var o=e.sdk.options.defaultConfig;return Object.keys(t).forEach(e=>{o[e]=t[e]}),o}return e.sdk.options.defaultConfig})}defaultConfig(e){this.sdk.options.defaultConfig=e}}class d extends i{constructor(e){super(e)}log(e,t){if(!Number.isInteger(e))return void(this.sdk.options.debug&&console.log("Bucket name should be an integer and not",e));if("object"!=typeof t)return void(this.sdk.options.debug&&console.log("Bucket params should be send as object and not "+typeof t,t));const o={method:"GET",params:t};return this.__call_log(e,o)}}class h extends i{constructor(e){super(e)}add(e){let t={p:e,__token:this.__getTokenToUse(),__identification:this.sdk.browserIdentification};window.location&&window.location.href&&(t.u=window.location.href);const o={method:"GET",params:t};return this.__call_log(0,o)}}"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var f=function(e,t,o){return e(o={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&o.path)}},o.exports),o.exports}((function(e,t){e.exports=function(e){function t(r){if(o[r])return o[r].exports;var n=o[r]={exports:{},id:r,loaded:!1};return e[r].call(n.exports,n,n.exports,t),n.loaded=!0,n.exports}var o={};return t.m=e,t.c=o,t.p="",t(0)}([function(e,t,o){e.exports=o(1)},function(e,t,o){function r(e){var t=new i(e),o=s(i.prototype.request,t);return n.extend(o,i.prototype,t),n.extend(o,t),o}var n=o(2),s=o(3),i=o(4),a=o(22),c=r(o(10));c.Axios=i,c.create=function(e){return r(a(c.defaults,e))},c.Cancel=o(23),c.CancelToken=o(24),c.isCancel=o(9),c.all=function(e){return Promise.all(e)},c.spread=o(25),e.exports=c,e.exports.default=c},function(e,t,o){function r(e){return"[object Array]"===u.call(e)}function n(e){return void 0===e}function s(e){return null!==e&&"object"==typeof e}function i(e){return"[object Function]"===u.call(e)}function a(e,t){if(null!=e)if("object"!=typeof e&&(e=[e]),r(e))for(var o=0,n=e.length;o<n;o++)t.call(null,e[o],o,e);else for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.call(null,e[s],s,e)}var c=o(3),u=Object.prototype.toString;e.exports={isArray:r,isArrayBuffer:function(e){return"[object ArrayBuffer]"===u.call(e)},isBuffer:function(e){return null!==e&&!n(e)&&null!==e.constructor&&!n(e.constructor)&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)},isFormData:function(e){return"undefined"!=typeof FormData&&e instanceof FormData},isArrayBufferView:function(e){return"undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&e.buffer instanceof ArrayBuffer},isString:function(e){return"string"==typeof e},isNumber:function(e){return"number"==typeof e},isObject:s,isUndefined:n,isDate:function(e){return"[object Date]"===u.call(e)},isFile:function(e){return"[object File]"===u.call(e)},isBlob:function(e){return"[object Blob]"===u.call(e)},isFunction:i,isStream:function(e){return s(e)&&i(e.pipe)},isURLSearchParams:function(e){return"undefined"!=typeof URLSearchParams&&e instanceof URLSearchParams},isStandardBrowserEnv:function(){return("undefined"==typeof navigator||"ReactNative"!==navigator.product&&"NativeScript"!==navigator.product&&"NS"!==navigator.product)&&"undefined"!=typeof window&&"undefined"!=typeof document},forEach:a,merge:function e(){function t(t,r){"object"==typeof o[r]&&"object"==typeof t?o[r]=e(o[r],t):o[r]=t}for(var o={},r=0,n=arguments.length;r<n;r++)a(arguments[r],t);return o},deepMerge:function e(){function t(t,r){"object"==typeof o[r]&&"object"==typeof t?o[r]=e(o[r],t):o[r]="object"==typeof t?e({},t):t}for(var o={},r=0,n=arguments.length;r<n;r++)a(arguments[r],t);return o},extend:function(e,t,o){return a(t,(function(t,r){e[r]=o&&"function"==typeof t?c(t,o):t})),e},trim:function(e){return e.replace(/^\s*/,"").replace(/\s*$/,"")}}},function(e,t){e.exports=function(e,t){return function(){for(var o=new Array(arguments.length),r=0;r<o.length;r++)o[r]=arguments[r];return e.apply(t,o)}}},function(e,t,o){function r(e){this.defaults=e,this.interceptors={request:new i,response:new i}}var n=o(2),s=o(5),i=o(6),a=o(7),c=o(22);r.prototype.request=function(e){"string"==typeof e?(e=arguments[1]||{}).url=arguments[0]:e=e||{},(e=c(this.defaults,e)).method?e.method=e.method.toLowerCase():this.defaults.method?e.method=this.defaults.method.toLowerCase():e.method="get";var t=[a,void 0],o=Promise.resolve(e);for(this.interceptors.request.forEach((function(e){t.unshift(e.fulfilled,e.rejected)})),this.interceptors.response.forEach((function(e){t.push(e.fulfilled,e.rejected)}));t.length;)o=o.then(t.shift(),t.shift());return o},r.prototype.getUri=function(e){return e=c(this.defaults,e),s(e.url,e.params,e.paramsSerializer).replace(/^\?/,"")},n.forEach(["delete","get","head","options"],(function(e){r.prototype[e]=function(t,o){return this.request(n.merge(o||{},{method:e,url:t}))}})),n.forEach(["post","put","patch"],(function(e){r.prototype[e]=function(t,o,r){return this.request(n.merge(r||{},{method:e,url:t,data:o}))}})),e.exports=r},function(e,t,o){function r(e){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}var n=o(2);e.exports=function(e,t,o){if(!t)return e;var s;if(o)s=o(t);else if(n.isURLSearchParams(t))s=t.toString();else{var i=[];n.forEach(t,(function(e,t){null!=e&&(n.isArray(e)?t+="[]":e=[e],n.forEach(e,(function(e){n.isDate(e)?e=e.toISOString():n.isObject(e)&&(e=JSON.stringify(e)),i.push(r(t)+"="+r(e))})))})),s=i.join("&")}if(s){var a=e.indexOf("#");-1!==a&&(e=e.slice(0,a)),e+=(-1===e.indexOf("?")?"?":"&")+s}return e}},function(e,t,o){function r(){this.handlers=[]}var n=o(2);r.prototype.use=function(e,t){return this.handlers.push({fulfilled:e,rejected:t}),this.handlers.length-1},r.prototype.eject=function(e){this.handlers[e]&&(this.handlers[e]=null)},r.prototype.forEach=function(e){n.forEach(this.handlers,(function(t){null!==t&&e(t)}))},e.exports=r},function(e,t,o){function r(e){e.cancelToken&&e.cancelToken.throwIfRequested()}var n=o(2),s=o(8),i=o(9),a=o(10);e.exports=function(e){return r(e),e.headers=e.headers||{},e.data=s(e.data,e.headers,e.transformRequest),e.headers=n.merge(e.headers.common||{},e.headers[e.method]||{},e.headers),n.forEach(["delete","get","head","post","put","patch","common"],(function(t){delete e.headers[t]})),(e.adapter||a.adapter)(e).then((function(t){return r(e),t.data=s(t.data,t.headers,e.transformResponse),t}),(function(t){return i(t)||(r(e),t&&t.response&&(t.response.data=s(t.response.data,t.response.headers,e.transformResponse))),Promise.reject(t)}))}},function(e,t,o){var r=o(2);e.exports=function(e,t,o){return r.forEach(o,(function(o){e=o(e,t)})),e}},function(e,t){e.exports=function(e){return!(!e||!e.__CANCEL__)}},function(e,t,o){function r(e,t){!n.isUndefined(e)&&n.isUndefined(e["Content-Type"])&&(e["Content-Type"]=t)}var n=o(2),s=o(11),i={"Content-Type":"application/x-www-form-urlencoded"},a={adapter:function(){var e;return("undefined"!=typeof XMLHttpRequest||"undefined"!=typeof process&&"[object process]"===Object.prototype.toString.call(process))&&(e=o(12)),e}(),transformRequest:[function(e,t){return s(t,"Accept"),s(t,"Content-Type"),n.isFormData(e)||n.isArrayBuffer(e)||n.isBuffer(e)||n.isStream(e)||n.isFile(e)||n.isBlob(e)?e:n.isArrayBufferView(e)?e.buffer:n.isURLSearchParams(e)?(r(t,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):n.isObject(e)?(r(t,"application/json;charset=utf-8"),JSON.stringify(e)):e}],transformResponse:[function(e){if("string"==typeof e)try{e=JSON.parse(e)}catch(e){}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,validateStatus:function(e){return e>=200&&e<300},headers:{common:{Accept:"application/json, text/plain, */*"}}};n.forEach(["delete","get","head"],(function(e){a.headers[e]={}})),n.forEach(["post","put","patch"],(function(e){a.headers[e]=n.merge(i)})),e.exports=a},function(e,t,o){var r=o(2);e.exports=function(e,t){r.forEach(e,(function(o,r){r!==t&&r.toUpperCase()===t.toUpperCase()&&(e[t]=o,delete e[r])}))}},function(e,t,o){var r=o(2),n=o(13),s=o(5),i=o(16),a=o(19),c=o(20),u=o(14);e.exports=function(e){return new Promise((function(t,l){var d=e.data,h=e.headers;r.isFormData(d)&&delete h["Content-Type"];var f=new XMLHttpRequest;if(e.auth){var p=e.auth.username||"",g=e.auth.password||"";h.Authorization="Basic "+btoa(p+":"+g)}var m=i(e.baseURL,e.url);if(f.open(e.method.toUpperCase(),s(m,e.params,e.paramsSerializer),!0),f.timeout=e.timeout,f.onreadystatechange=function(){if(f&&4===f.readyState&&(0!==f.status||f.responseURL&&0===f.responseURL.indexOf("file:"))){var o="getAllResponseHeaders"in f?a(f.getAllResponseHeaders()):null,r={data:e.responseType&&"text"!==e.responseType?f.response:f.responseText,status:f.status,statusText:f.statusText,headers:o,config:e,request:f};n(t,l,r),f=null}},f.onabort=function(){f&&(l(u("Request aborted",e,"ECONNABORTED",f)),f=null)},f.onerror=function(){l(u("Network Error",e,null,f)),f=null},f.ontimeout=function(){var t="timeout of "+e.timeout+"ms exceeded";e.timeoutErrorMessage&&(t=e.timeoutErrorMessage),l(u(t,e,"ECONNABORTED",f)),f=null},r.isStandardBrowserEnv()){var k=o(21),_=(e.withCredentials||c(m))&&e.xsrfCookieName?k.read(e.xsrfCookieName):void 0;_&&(h[e.xsrfHeaderName]=_)}if("setRequestHeader"in f&&r.forEach(h,(function(e,t){void 0===d&&"content-type"===t.toLowerCase()?delete h[t]:f.setRequestHeader(t,e)})),r.isUndefined(e.withCredentials)||(f.withCredentials=!!e.withCredentials),e.responseType)try{f.responseType=e.responseType}catch(t){if("json"!==e.responseType)throw t}"function"==typeof e.onDownloadProgress&&f.addEventListener("progress",e.onDownloadProgress),"function"==typeof e.onUploadProgress&&f.upload&&f.upload.addEventListener("progress",e.onUploadProgress),e.cancelToken&&e.cancelToken.promise.then((function(e){f&&(f.abort(),l(e),f=null)})),void 0===d&&(d=null),f.send(d)}))}},function(e,t,o){var r=o(14);e.exports=function(e,t,o){var n=o.config.validateStatus;!n||n(o.status)?e(o):t(r("Request failed with status code "+o.status,o.config,null,o.request,o))}},function(e,t,o){var r=o(15);e.exports=function(e,t,o,n,s){var i=new Error(e);return r(i,t,o,n,s)}},function(e,t){e.exports=function(e,t,o,r,n){return e.config=t,o&&(e.code=o),e.request=r,e.response=n,e.isAxiosError=!0,e.toJSON=function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:this.config,code:this.code}},e}},function(e,t,o){var r=o(17),n=o(18);e.exports=function(e,t){return e&&!r(t)?n(e,t):t}},function(e,t){e.exports=function(e){return/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e)}},function(e,t){e.exports=function(e,t){return t?e.replace(/\/+$/,"")+"/"+t.replace(/^\/+/,""):e}},function(e,t,o){var r=o(2),n=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"];e.exports=function(e){var t,o,s,i={};return e?(r.forEach(e.split("\n"),(function(e){if(s=e.indexOf(":"),t=r.trim(e.substr(0,s)).toLowerCase(),o=r.trim(e.substr(s+1)),t){if(i[t]&&n.indexOf(t)>=0)return;i[t]="set-cookie"===t?(i[t]?i[t]:[]).concat([o]):i[t]?i[t]+", "+o:o}})),i):i}},function(e,t,o){var r=o(2);e.exports=r.isStandardBrowserEnv()?function(){function e(e){var t=e;return o&&(n.setAttribute("href",t),t=n.href),n.setAttribute("href",t),{href:n.href,protocol:n.protocol?n.protocol.replace(/:$/,""):"",host:n.host,search:n.search?n.search.replace(/^\?/,""):"",hash:n.hash?n.hash.replace(/^#/,""):"",hostname:n.hostname,port:n.port,pathname:"/"===n.pathname.charAt(0)?n.pathname:"/"+n.pathname}}var t,o=/(msie|trident)/i.test(navigator.userAgent),n=document.createElement("a");return t=e(window.location.href),function(o){var n=r.isString(o)?e(o):o;return n.protocol===t.protocol&&n.host===t.host}}():function(){return!0}},function(e,t,o){var r=o(2);e.exports=r.isStandardBrowserEnv()?{write:function(e,t,o,n,s,i){var a=[];a.push(e+"="+encodeURIComponent(t)),r.isNumber(o)&&a.push("expires="+new Date(o).toGMTString()),r.isString(n)&&a.push("path="+n),r.isString(s)&&a.push("domain="+s),!0===i&&a.push("secure"),document.cookie=a.join("; ")},read:function(e){var t=document.cookie.match(new RegExp("(^|;\\s*)("+e+")=([^;]*)"));return t?decodeURIComponent(t[3]):null},remove:function(e){this.write(e,"",Date.now()-864e5)}}:{write:function(){},read:function(){return null},remove:function(){}}},function(e,t,o){var r=o(2);e.exports=function(e,t){t=t||{};var o={},n=["url","method","params","data"],s=["headers","auth","proxy"],i=["baseURL","url","transformRequest","transformResponse","paramsSerializer","timeout","withCredentials","adapter","responseType","xsrfCookieName","xsrfHeaderName","onUploadProgress","onDownloadProgress","maxContentLength","validateStatus","maxRedirects","httpAgent","httpsAgent","cancelToken","socketPath"];r.forEach(n,(function(e){void 0!==t[e]&&(o[e]=t[e])})),r.forEach(s,(function(n){r.isObject(t[n])?o[n]=r.deepMerge(e[n],t[n]):void 0!==t[n]?o[n]=t[n]:r.isObject(e[n])?o[n]=r.deepMerge(e[n]):void 0!==e[n]&&(o[n]=e[n])})),r.forEach(i,(function(r){void 0!==t[r]?o[r]=t[r]:void 0!==e[r]&&(o[r]=e[r])}));var a=n.concat(s).concat(i),c=Object.keys(t).filter((function(e){return-1===a.indexOf(e)}));return r.forEach(c,(function(r){void 0!==t[r]?o[r]=t[r]:void 0!==e[r]&&(o[r]=e[r])})),o}},function(e,t){function o(e){this.message=e}o.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")},o.prototype.__CANCEL__=!0,e.exports=o},function(e,t,o){function r(e){if("function"!=typeof e)throw new TypeError("executor must be a function.");var t;this.promise=new Promise((function(e){t=e}));var o=this;e((function(e){o.reason||(o.reason=new n(e),t(o.reason))}))}var n=o(23);r.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},r.source=function(){var e;return{token:new r((function(t){e=t})),cancel:e}},e.exports=r},function(e,t){e.exports=function(e){return function(t){return e.apply(null,t)}}}])}));void 0===window.axios&&(window.axios=f);class p{constructor(e){const o=this;let r=Object.assign({},t,e);if(r.debug&&console.log("%cPreviolet Javascript SDK instantiated in debug mode","color: #CC00FF"),r.instance&&"<%= previolet.options.instance %>"==r.instance&&r.fallback&&r.fallback.instance&&(r.debug&&console.log("Using fallback instance",r.fallback.instance),r.instance=r.fallback.instance),r.tokenFallback&&r.tokenOverride)throw"Cannot define both tokenFallback and tokenOverride";r.tokenFallback&&"<%= previolet.token.guest %>"==r.tokenFallback&&(r.fallback&&r.fallback.tokenFallback?(r.debug&&console.log("Using fallback tokenFallback",r.fallback.tokenFallback),r.tokenFallback=r.fallback.tokenFallback):(r.debug&&console.log("No fallback tokenFallback provided, defaulting to false"),r.tokenFallback=!1)),r.tokenOverride&&"<%= previolet.token.guest %>"==r.tokenOverride&&(r.fallback&&r.fallback.tokenOverride?(r.debug&&console.log("Using fallback tokenOverride",r.fallback.tokenOverride),r.tokenOverride=r.fallback.tokenOverride):(r.debug&&console.log("No fallback tokenOverride provided, defaulting to false"),r.tokenOverride=!1));let i=!1,f=null,p=null,g={};this.changeHooks=[],this.storageApi=function(e){switch(e.storageType){case"localStorage":try{return n.localStorage.setItem("testKey","test"),n.localStorage.removeItem("testKey"),new s(e.storageNamespace)}catch(e){}default:return new s(e.storageNamespace)}}(r),this.auth=()=>({GithubAuthProvider:{id:"github"},GoogleAuthProvider:{id:"google"},FacebookAuthProvider:{id:"facebook"},logout:e=>{if(!o.auth().isAuthenticated())return Promise.reject(new Error("There is no authenticated user"));(e=e||{}).preventUserStatePropagation=e.preventUserStatePropagation||!1;const t={method:"DELETE",data:JSON.stringify({token:o.token})};return o.options.debug&&console.log("Logging Out"),o.token=!1,o.storageApi.removeItem(o.options.tokenName),o.storageApi.removeItem(o.options.applicationStorage),o.storageApi.removeItem(o.options.userStorage),e.preventUserStatePropagation||o.__propagateUserState(!1),o.__call("/__/token",t,"token").then(e=>e)},loginWithUsernameAndPassword:(e,t)=>{if(!e)return Promise.reject(new Error("username required"));if(!t)return Promise.reject(new Error("password required"));o.options.debug&&console.log("Logging In with username and password",e,t);const r={method:"POST",data:JSON.stringify({name:e,challenge:t,expire:o.options.userTokenExpiration})};return o.__call("/__/auth",r).then(e=>(o.__checkError(o,e),o.__loadAuthenticationDataFromResponse(e),null!==o.currentUser&&o.__propagateUserState(o.currentUser),e.result.data))},loginWithIdentityProvider:(e,t)=>{t=t||this.last_access_token,this.last_access_token=t,this.options.debug&&console.log("Logging In with identity provider:",e,t);const r={method:"POST",params:{access_token:t}};return this.__call("/__/auth/identity/"+e,r).then(e=>(this.__checkError(o,e),e.result?e.result&&(e.result.token&&e.result.auth?(o.__loadAuthenticationDataFromResponse(e),o.__propagateUserState(e.result.auth)):o.__propagateUserState(!1)):o.__propagateUserState(!1),e.result))},forgotPassword:(e,t)=>{if(!e)return Promise.reject(new Error("username required"));var r=t&&t.origin?t.origin:window.location.origin,n=!(!t||!t.skip_email)&&t.skip_email;const s={method:"POST",data:JSON.stringify({name:e,origin:r,skip_email:n})};return o.__call("/__/auth/reset",s).then(e=>(o.__checkError(o,e),e.result))},forgotPasswordConfirmation:(e,t,r)=>{if(!e)return Promise.reject(new Error("challenge required"));if(!t)return Promise.reject(new Error("confirm_challenge required"));if(!r)return Promise.reject(new Error("hash required"));const n={method:"POST",data:JSON.stringify({challenge:e,confirm_challenge:t,hash:r})};return o.__call("/__/auth/reset/confirm",n).then(e=>(o.__checkError(o,e),e.result))},registerWithIdentityProvider:(e,t,r,n)=>{r=r||this.last_access_token,n=n||!0,this.last_access_token=r;const s={method:"POST",data:{access_token:r,email:t,role:"admin"}};return this.__call("/__/auth/identity/"+e+"/register",s).then(t=>(this.__checkError(o,t),n?this.loginWithIdentityProvider(e,r):t))},isAuthenticated:()=>!!o.token,loginAsGuest:()=>{const e={method:"POST",data:JSON.stringify({expire:o.options.guestTokenExpiration})};return o.__call("/__/auth/guest",e).then(e=>{if(!e.error_code)return o.__loadAuthenticationDataFromResponse(e),null!==o.currentUser&&o.__propagateUserState(o.currentUser),e.result.data;o.auth().logout()})},onAuthStateChanged:e=>{if("function"==typeof e){-1==o.changeHooks.indexOf(e)?(o.options.debug&&console.log("Registered callback function: onAuthStateChanged",e),o.changeHooks.push(e)):o.options.debug&&console.log("Callback function onAuthStateChanged is already registered",e);var t=o.currentUser,r=o.token;return o.options.debug&&(t&&r?console.log("User is logged in",t):console.log("User is not logged in")),e(!(!r||!t)&&t)}return o.options.debug&&console.log("User is not logged in"),!1}}),Object.defineProperties(this,{options:{get:()=>r},token:{get:()=>i,set(e){e!=i&&(i=e,o.storageApi.setItem(r.tokenName,i))}},headers:{get:()=>g},currentApp:{get:()=>f,set(e){f=e,o.storageApi.setItem(r.applicationStorage,btoa(JSON.stringify(e)))}},currentUser:{get:()=>p,set(e){p=e,o.storageApi.setItem(r.userStorage,btoa(JSON.stringify(e)))}},browserIdentification:{get:()=>o.__storageGet(o.options.browserIdentification),set(e){var t,n;e.ts=e.ts||Date.now(),e.rnd=e.rnd||(t=(t=1e4)||100,n=(n=99999)||999,Math.floor(Math.random()*n+t)),o.storageApi.setItem(r.browserIdentification,btoa(JSON.stringify(e)))}}}),o.app=()=>({region:o.options.region,token:o.storageApi.getItem(o.options.tokenName)||!1,data:o.__storageGet(o.options.applicationStorage)});var m=o.app().token;if(o.token=m,o.browserIdentification){o.options.debug&&console.log("Browser identification exists",o.browserIdentification);var k={ua:navigator.userAgent,lang:navigator.language||navigator.userLanguage,plat:navigator.platform,vsdk:o.options.sdkVersion,vapp:o.options.appVersion,ts:o.browserIdentification.ts,rnd:o.browserIdentification.rnd};JSON.stringify(k)!=JSON.stringify(o.browserIdentification)&&(o.options.debug&&console.log("Browser identification changed, renewing",k),o.browserIdentification=k)}else o.browserIdentification={ua:navigator.userAgent,lang:navigator.language||navigator.userLanguage,plat:navigator.platform,vsdk:o.options.sdkVersion,vapp:o.options.appVersion},o.options.debug&&console.log("Generating browser identification",o.browserIdentification);var _=new a(o).addToErrorChain(o,o.__checkError);o.db=()=>_;var b=new c(o).addToErrorChain(o,o.__checkError);o.functions=()=>b;var v=new u(o).addToErrorChain(o,o.__checkError);o.storage=()=>v;var w=new l(o).addToErrorChain(o,o.__checkError);o.remoteConfig=()=>w;var y=new d(o).addToErrorChain(o,o.__checkError);o.bucket=()=>y;var E=new h(o).addToErrorChain(o,o.__checkError);o.trace=()=>E,o.user=()=>({data:o.__storageGet(o.options.userStorage)}),o.currentUser=o.user().data}getDefaultHeaders(){return Object.assign({},this.headers,{})}getRemoteConfig(){const e=this;return this.functions().getRemoteConfig().then(t=>{if("object"==typeof t){var o=e.options.defaultConfig;return Object.keys(t).forEach(e=>{o[e]=t[e]}),o}return e.options.defaultConfig})}__propagateUserState(e){const t=this;t.changeHooks.forEach(o=>{t.options.debug&&console.log("Triggering onAuthStateChanged callback",e),o(e)})}__loadAuthenticationDataFromResponse(e){e.result.token&&(this.options.debug&&console.log("Saving token",e.result.token),this.token=e.result.token),e.result.auth?(this.options.debug&&console.log("Saving user details",e.result.auth),this.currentUser=e.result.auth):(this.options.debug&&console.log("Saving default guest details"),this.currentUser={name:"Guest",username:"guest",guest:!0}),e.result.data&&(e.result.data[this.options.instance]&&e.result.data[this.options.instance].instance_data?(this.currentApp=e.result.data[this.options.instance].instance_data,this.options.debug&&console.log("Saving application details",this.currentApp)):this.options.debug&&console.log("Application details not available"))}__call(t,o,r){r=r||this.options.instance,o.headers=this.getDefaultHeaders();var n=this.options.reqIndex++,s=e(this.options,r)+t;return this.options.debug&&console.log("> XHR Request ("+n+")",s,o),f(s,o).then(e=>(this.options.debug&&console.log("< XHR Response ("+n+")",e),e.data)).catch(e=>{throw e})}__storageGet(e){var t=this.storageApi.getItem(e),o=!1;if(t)try{o=JSON.parse(atob(t))}catch(e){}return o}__checkError(e,t){if(t.error)throw e.options.debug&&console.log("%cBackend error details","color: #FF3333",t),!t.error_code||t.error_code!=o&&t.error_code!=r||(e.user().data.guest?e.auth().loginAsGuest():e.auth().logout()),t}}export default p;export{p as PrevioletSDK};
