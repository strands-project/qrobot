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
    this.tasks.add(new Task(description, fn, minDuration))
  },

  run: function run (callback) {
    async.waterfall(this.tasks.map(function (task) {
      return task.fn
    }), function (err, result) {
      callback(err, result)
    })
  }
})

