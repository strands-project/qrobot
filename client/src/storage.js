var _ = require('lodash')

/** Session storage with access to the peer tabs.
  * get() looks up a given key in the session storage. If not found, then the
  * peer tabs are queried. The result is passed to the a callback function.
  * If the key does not exist in session storage and was not supplied by any
  * of the peer tabs within timeout, then undefined is passed to the callback.
  */

var Storage = function (spec) {
  spec || (spec = {})
  this.timeout = spec.timeout || 1000
  this.GET_EVENT = '__get__'
  this.SET_EVENT = '__set__'
  window.addEventListener('storage', _.bind(this._dispatch, this), false)
}

Storage.prototype.set = function (key, value) {
  window.sessionStorage.setItem(key, value)
}

Storage.prototype.get = function (key, fn) {
  if (this.request) throw new Error('Storage.get() is not reentrant, wait until the previous call is finished')
  if (key in window.sessionStorage) {
    fn(window.sessionStorage.getItem(key))
  } else {
    this.request = {
      key: key,
      callback: fn,
      timer: setTimeout(_.bind(this._callAndDestroy, this), this.timeout)
    }
    window.localStorage.setItem(this.GET_EVENT, key)
    window.localStorage.removeItem(this.GET_EVENT, key)
  }
}

Storage.prototype._dispatch = function (event) {
  if (!event.key || !event.newValue) return
  console.log('Dispatch event')
  if (event.key === this.GET_EVENT && event.newValue in window.sessionStorage) {
    console.log('Sending → other tab')
    // Another tab asked for the sessionStorage → send it
    window.localStorage.setItem(this.SET_EVENT, window.sessionStorage.getItem(event.newValue))
    // The other tab should now have it, so we're done with it.
    window.localStorage.removeItem(this.SET_EVENT)
  } else if (event.key === this.SET_EVENT && this.request) {
    console.log('Receiving ← other tab')
    // Another tab sent data ← get it
    window.sessionStorage.setItem(this.request.key, event.newValue)
    clearTimeout(this.request.timer)
    this._callAndDestroy(event.newValue)
  }
}

Storage.prototype._callAndDestroy = function (value) {
  var callback = this.request.callback
  delete this.request
  callback(value)
}

module.exports = Storage
