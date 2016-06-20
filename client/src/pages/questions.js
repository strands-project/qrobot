var _ = require('lodash')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')
var pluralize = require('pluralize')

var config = require('config')
var Answer = require('app/models/answer')
var Carousel = require('app/components/carousel')
var Label = require('app/models/label')
var LabelEditor = require('app/components/label-editor')
var Question = require('app/models/question')
var ThreeViewer = require('app/three/three-viewer')
var TaskRunner = require('app/components/task-runner')

var SuggestionView = AmpersandView.extend({
  template: '<li><a data-hook="name"></a></li>',
  autoRender: true,

  bindings: {
    'model.name': '[data-hook=name]',
    'model.selected': {
      type: 'toggle',
      selector: 'li',
      invert: true
    }
  },

  events: {
    'click a': 'handleClick'
  },

  handleClick: function handleClick () {
    this.model.selected = !this.model.selected
  }
})

module.exports = AmpersandView.extend({
  pageTitle: 'Question',
  requiresLogin: true,

  template: require('app/templates/questions.jade'),

  events: {
    'click [data-hook=skip]': 'handleSkipClick',
    'click [data-hook=submit]': 'handleSubmitClick',
    'click [data-hook=suggestions] a': 'handleSuggestionClick'
  },

  children: {
    question: Question.Model
  },

  collections: {
    suggestions: Label.Collection
  },

  subviews: {
    viewer: {
      hook: 'viewer',
      prepareView: function (el) {
        return new ThreeViewer({
          aspect: 2,
          el: el
        })
      }
    },
    carousel: {
      hook: 'images',
      constructor: Carousel.View
    },
    labelEditor: {
      hook: 'label-editor',
      constructor: LabelEditor.View
    },
    suggestionsView: {
      hook: 'suggestions',
      prepareView: function (el) {
        return this.renderCollection(this.suggestions, SuggestionView, el)
      }
    }
  },

  initialize: function initialize () {
    console.log('[Questions] initialize')
    this.questionsAnswered = 0
  },

  render: function () {
    var that = this
    console.log('[Questions] render')
    this.renderWithTemplate(this)
    this.listenTo(this.labelEditor.labels, 'add', this.handleLabelAdd)
    this.listenTo(this.labelEditor.labels, 'remove', this.handleLabelRemove)

    var taskRunner = new TaskRunner.Model()
    taskRunner.addTask('Fetching next question', _.bind(this.taskFetchQuestion, this), 2000)
    app.view.modal.show(new TaskRunner.View({ model: taskRunner }))
    taskRunner.run(function () {
      that.displayQuestion()
      that.carousel.cycle = true
      app.view.modal.hide()
    })

    return this
  },

  handleSubmitClick: function handleSubmitClick () {
    var labels = this.labelEditor.labels.map(function (label) {
      return label.name
    })
    if (labels.length) {
      var answer = new Answer.Model({
        question_id: this.question.getId(),
        user_id: app.me.getId(),
        labels: labels
      })
      this.submitAnswer(answer)
    }
  },

  handleSkipClick: function handleSkipClick () {
    var answer = new Answer.Model({
      question_id: this.question.getId(),
      user_id: app.me.getId()
    })
    this.submitAnswer(answer)
  },

  handleSuggestionClick: function handleSuggestionClick (e) {
    this.labelEditor.labels.add({ name: e.target.innerText })
  },

  handleLabelAdd: function handleLabelAdd (e) {
    if (this.suggestions.contains(e.name)) {
      this.suggestions.contains(e.name).selected = true
    }
  },

  handleLabelRemove: function handleLabelRemove (e) {
    this.suggestions.forEach(function (suggestion) {
      if (suggestion.name === e.name && suggestion.selected) {
        suggestion.selected = false
      }
    })
  },

  submitAnswer: function submitAnswer (answer) {
    var that = this
    this.questionsAnswered += 1
    answer.duration = ((new Date()).getTime() - this.timeStart) / 1000

    var taskRunner = new TaskRunner.Model()
    taskRunner.addTask('Saving your answer', _.bind(this.taskSaveAnswer, this, answer), 1000)
    taskRunner.addTask('Fetching next question', _.bind(this.taskFetchQuestion, this), 1000)

    this.carousel.cycle = false
    this.viewer.spin = false
    app.view.modal.show(new TaskRunner.View({ model: taskRunner }))
    taskRunner.run(function () {
      that.displayQuestion()
      app.view.modal.hide()
      that.carousel.cycle = true
      that.viewer.reset()
      that.viewer.spin = true
    })
  },

  displayQuestion: function displayQuestion () {
    var that = this
    // Visualize model
    this.viewer.uri = this.question.point_cloud_uri
    // Visualize images
    this.carousel.images.reset()
    _.forEach(this.question.image_ids, function (image_id) {
      that.carousel.images.add({ src: config.api.url + '/file/image/' + image_id })
    })
    this.carousel.cycle = true
    // Show suggested labels
    this.suggestions.reset()
    this.suggestions.add(_.map(this.question.suggested_labels, function (label) {
      return new Label.Model({ name: label })
    }))
    this.labelEditor.labels.reset()
    this.timeStart = (new Date()).getTime()
  },

  taskFetchQuestion: function taskFetchQuestion (callback) {
    var that = this
    this.question = new Question.Model()
    this.question.fetch({
      success: function (question, response) {
        if (question.getId()) {
          console.log('Received a question #', question.getId())
          callback(null)
        } else {
          // No more questions
          console.log('No more questions!')
          var flash = 'Well done, you have answered ' + pluralize('question', that.questionsAnswered, true) + '! That\'s all we have for now. We will shoot you an e-mail when we have more questions.'
          callback(null)
          app.navigate('/', { 'flash': flash, 'noQuestions': true })
        }
      },
      error: function () {
        callback(new Error('Could not connect to the server'))
      }
    })
  },

  taskSaveAnswer: function taskSaveAnswer (answer, callback) {
    answer.save(null, {
      success: function (model, response, options) {
        callback(null)
      },
      error: function (model, response, options) {
        callback(new Error(response.body))
      }
    })
  }
})
