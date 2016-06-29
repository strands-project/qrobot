var _ = require('lodash')
var AmpersandModel = require('ampersand-model')

module.exports = AmpersandModel.extend({
  props: {
    description: 'string',

    message: 'string',

    state: {
      type: 'string',
      values: ['pending', 'active', 'succeeded', 'failed'],
      default: 'pending'
    }
  },

  initialize: function initialize (description, fn, minDuration) {
    this.description = description || ''
    this.minDuration = typeof minDuration === 'number' ? minDuration : 0
    this.fn = _.bind(this.start, this, fn)
  },

  start: function start (fn, callback) {
    this.started = (new Date()).getTime()
    this.state = 'active'
    this.callback = callback
    fn(this.done.bind(this))
  },

  done: function (err, args) {
    var duration = ((new Date()).getTime() - this.started)
    var timeout = this.minDuration - duration
    var task = this
    _.delay(function () {
      if (err === null) {
        task.state = 'succeeded'
        task.message = ''
      } else {
        task.state = 'failed'
        task.message = err.message
      }
      task.callback(null) // here second argument (if given) replaces next callback!
    }, timeout)
  }
})
