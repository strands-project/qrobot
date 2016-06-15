var $ = require('jquery')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')

var config = require('config')
var TaskRunner = require('app/components/task-runner')

var ConfirmView = AmpersandView.extend({
  template: require('app/templates/profile-confirm.jade'),

  autoRender: true,

  props: {
    welcome: ['boolean', true, false]
  },

  bindings: {
    'welcome': {
      type: 'toggle',
      hook: 'welcome'
    }
  }
})

var QuestionsView = AmpersandView.extend({
  template: require('app/templates/profile-questions.jade'),

  autoRender: true,

  props: {
    numQuestionsTotal: ['number', true, 0],
    numQuestionsAnswered: ['number', true, 0]
  },

  derived: {
    numQuestionsUnanswered: {
      deps: ['numQuestionsTotal', 'numQuestionsAnswered'],
      fn: function () {
        return this.numQuestionsTotal - this.numQuestionsAnswered
      }
    },

    hasQuestions: {
      deps: ['numQuestionsUnanswered'],
      fn: function () {
        return this.numQuestionsUnanswered > 0
      }
    }
  },

  bindings: {
    'hasQuestions': [
      {
        type: 'booleanClass',
        selector: '.widget',
        name: 'widget-success'
      },
      {
        type: 'toggle',
        hook: 'has-questions'
      },
      {
        type: 'toggle',
        hook: 'has-no-questions',
        invert: true
      }
    ],
    'numQuestionsTotal': '[data-hook=num-questions-total]',
    'numQuestionsUnanswered': '[data-hook=num-questions-unanswered]'
  }
})

module.exports = AmpersandView.extend({
  pageTitle: 'Profile',
  withNavbar: true,
  requiresLogin: true,

  props: {
    username: 'string'
  },

  bindings: {
    username: {
      type: 'text',
      hook: 'username'
    }
  },

  template: require('app/templates/profile.jade'),

  initialize: function initialize () {
    this.username = app.me.name
  },

  render: function render () {
    var that = this
    this.renderWithTemplate(this)
    if (!app.me.email_confirmed) {
      this.confirmView = this.renderSubview(new ConfirmView(), '[data-hook=confirm]')
    }
    $.ajax(config.api.url + '/question/stats', {
      method: 'GET',
      headers: app.getAuthHeader()
    }).fail(function (xhr, status, err) {
    }).done(function (data) {
      if (data.status === 'success') {
        that.questionsView = that.renderSubview(new QuestionsView(), '[data-hook=questions]')
        that.questionsView.numQuestionsTotal = data.questions
        that.questionsView.numQuestionsAnswered = data.answers
      } else {
      }
    })
  },

  // Actions

  home: function (query) {
  },

  welcome: function () {
    this.confirmView.welcome = true
  },

  resend: function () {
    var taskRunner = new TaskRunner.Model()
    taskRunner.addTask('Sending confirmation e-mail', function (callback) {
      $.ajax(config.api.url + '/user/resend', {
        method: 'POST',
        headers: app.getAuthHeader()
      }).fail(function (xhr, status, err) {
        callback(new Error('Could not connect to the server'))
      }).done(function (data) {
        if (data.status === 'success') {
          callback(null)
        } else {
          callback(new Error(data.message))
        }
      })
    }, 1500)

    app.view.modal.show(new TaskRunner.View({ model: taskRunner }))
    taskRunner.run(function () {
      app.view.modal.hide()
    })
  }
})
