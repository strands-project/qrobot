var $ = require('jquery')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')

var config = require('config')
var TaskRunner = require('app/components/task-runner')

var FlashView = AmpersandView.extend({
  template: require('app/templates/profile-flash.jade'),
  autoRender: true,

  props: {
    message: 'string'
  },

  bindings: {
    message: {
      type: 'text',
      hook: 'message'
    }
  }
})

var ConfirmView = AmpersandView.extend({
  template: require('app/templates/profile-confirm.jade'),
  autoRender: true
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
        yes: 'widget-success',
        no: 'widget-default'
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
    if (app.message) {
      this.flashView = this.renderSubview(new FlashView({ 'message': app.message }), '[data-hook=flash]')
      delete app.message
    }
    if (!app.me.email_confirmed) {
      this.confirmView = this.renderSubview(new ConfirmView(), '[data-hook=confirm]')
    }
    this.questionsView = this.renderSubview(new QuestionsView(), '[data-hook=questions]')
    $.ajax(config.api.url + '/question/stats', {
      method: 'GET',
      headers: app.getAuthHeader()
    }).fail(function (xhr, status, err) {
    }).done(function (data) {
      if (data.status === 'success') {
        that.questionsView.numQuestionsTotal = data.questions
        that.questionsView.numQuestionsAnswered = data.answers
      } else {
      }
    })
  },

  // Actions

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
