var $ = require('jquery')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')
var dom = require('ampersand-dom')

var config = require('config')
var Alert = require('app/components/alert')
var Ladda = require('app/components/ladda')

module.exports = AmpersandView.extend({
  pageTitle: 'Feedback',
  requiresLogin: true,

  template: require('app/templates/feedback.jade'),

  render: function render () {
    this.renderWithTemplate(this)
    this.submitButton = new Ladda.View({
      el: this.queryByHook('submit'),
      caption: 'Submit',
      block: true,
      type: 'primary',
      style: 'slide-right',
      tabindex: 2
    })
    this.cacheElements({
      textarea: 'textarea',
      group: 'div.form-group'
    })
    this.listenTo(this.submitButton, 'submit', this.handleFormSubmitted)
    this.alert = new Alert.View({ el: this.queryByHook('alert') })
    this.registerSubview(this.alert)
    return this
  },

  handleFormSubmitted: function handleFormSubmitted () {
    var that = this
    var message = this.textarea.value
    if (message === '') {
      dom.addClass(this.group, 'has-error')
      return
    } else {
      dom.removeClass(this.group, 'has-error')
    }
    var xhr = $.ajax(config.api.url + '/feedback', {
      method: 'POST',
      data: JSON.stringify({ 'message': message }),
      headers: app.getAuthHeader(),
      contentType: 'application/json'
    }).fail(function (xhr, status, err) {
      that.alert.set({
        message: 'Something went wrong',
        type: 'danger',
        visible: true
      })
    }).done(function (data) {
      if (data.status === 'success') {
        app.navigate('/', { 'flash': data.message })
      } else {
        that.alert.set({
          message: data.message,
          type: 'danger',
          visible: true
        })
      }
    })
    this.submitButton.start(xhr)
  }
})
