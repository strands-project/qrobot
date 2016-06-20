var $ = require('jquery')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')
var pluralize = require('pluralize')

var config = require('config')
var Flash = require('app/components/flash')
var TaskRunner = require('app/components/task-runner')
var Widget = require('app/components/widget')

var QuestionsWidget = Widget.View.extend({
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

  initialize: function initialize () {
    this.icon = 'question-circle'
    this.listenToAndRun(this, 'change:hasQuestions', function () {
      if (this.hasQuestions) {
        this.type = 'success'
        this.heading = 'We have ' + pluralize('question', this.numQuestionsUnanswered, true) + ' for you'
        this.details = 'Start <a href="/question">answering</a> questions'
      } else {
        this.type = 'default'
        this.heading = 'We don\'t have any questions right now'
        this.details = 'We will shoot you an e-mail when the robot has new questions'
      }
    })
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

  template: require('app/templates/index.jade'),

  initialize: function initialize (params) {
    this.username = app.me.name
    this.params = params
  },

  render: function render () {
    var that = this
    this.renderWithTemplate(this)
    if (this.params['flash']) {
      this.flashView = this.renderSubview(new Flash.View({
        'message': this.params['flash']
      }), '[data-hook=flash]')
    }
    if (!this.params['noQuestions']) {
      this.questions = this.renderSubview(new QuestionsWidget(), '[data-hook=questions]')
      $.ajax(config.api.url + '/question/stats', {
        method: 'GET',
        headers: app.getAuthHeader()
      }).fail(function (xhr, status, err) {
      }).done(function (data) {
        if (data.status === 'success') {
          that.questions.numQuestionsTotal = data.questions
          that.questions.numQuestionsAnswered = data.answers
        } else {
        }
      })
    }
    if (!(app.me.email_confirmed || this.params['noConfirm'])) {
      this.confirm = this.renderSubview(new Widget.View({
        heading: 'Please confirm your e-mail address',
        icon: 'envelope',
        type: 'warning',
        details: 'If you did not receive a confirmation e-mail, please check your spam folder or request <a href="#resend">resend</a>'
      }), '[data-hook=confirm]')
    }
    this.feedback = this.renderSubview(new Widget.View({
      heading: 'Feedback',
      icon: 'comment',
      details: 'Click <a href="/feedback">here</a> to tell us what you think'
    }), '[data-hook=feedback]')
    return this
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
