var _ = require('lodash')
var $ = require('jquery')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')

var config = require('config')
var TaskRunner = require('app/components/task-runner')

module.exports = AmpersandView.extend({
  requiresLogin: true,
  template: '<div></div>',

  initialize: function initialize (params) {
    var taskRunner = new TaskRunner.Model()
    taskRunner.addTask('Confirming e-mail address', _.bind(this.taskConfirmEmail, this, params.positional[0]), 1500)

    app.view.modal.show(new TaskRunner.View({ model: taskRunner }))
    taskRunner.run(function () {
      if (!this.error) {
        app.navigate()
      }
    })
  },

  taskConfirmEmail: function taskConfirmEmail (token, callback) {
    $.ajax(config.api.url + '/user/confirm/' + token, {
      method: 'POST',
      headers: app.getAuthHeader()
    }).fail(function (xhr, status, err) {
      callback(new Error('Could not connect to the server'))
    }).done(function (data) {
      if (data.status === 'success') {
        app.me.email_confirmed = true
        callback(null)
      } else {
        console.log('problems ' + data.message)
        callback(new Error(data.message))
      }
    })
  }
})
