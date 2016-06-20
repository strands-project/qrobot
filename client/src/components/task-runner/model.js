var _ = require('lodash')
var AmpersandCollection = require('ampersand-collection')
var AmpersandState = require('ampersand-state')
var async = require('async')

var Task = require('./task-model')

module.exports = AmpersandState.extend({

  props: {
    error: 'any',
    result: 'any'
  },

  initialize: function initialize () {
    this.tasks = new AmpersandCollection([], { model: Task })
  },

  addTask: function addTask (description, fn, minDuration) {
    var task = new Task()
    task.description = description
    task.fn = function (callback) {
      task.started = (new Date()).getTime()
      task.state = 'active'
      fn(function (err, args) {
        callback = _.partial(callback, err, args)
        var duration = ((new Date()).getTime() - task.started)
        var timeout = typeof minDuration === 'number' ? minDuration - duration : 0
        setTimeout(function () {
          if (err === null) {
            task.state = 'succeeded'
            task.message = ''
          } else {
            task.state = 'failed'
            task.message = err.message
          }
          callback()
        }, timeout)
      })
    }
    this.tasks.add(task)
  },

  run: function run (callback) {
    var that = this
    async.waterfall(this.tasks.map(function (task) {
      return task.fn
    }), function (err, result) {
      that.error = err
      that.result = result
      callback.call(that)
    })
  }
})

