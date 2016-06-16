var $ = require('jquery')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')

var config = require('config')
var Alert = require('app/components/alert')
var Ladda = require('app/components/ladda')

module.exports = AmpersandView.extend({
  pageTitle: 'Feedback',
  requiresLogin: true,

  template: require('app/templates/feedback.jade'),

  render: function render () {
    this.renderWithTemplate(this)
    this.alert = new Alert.View({ el: this.queryByHook('alert') })
    this.submitButton = new Ladda.View({
      el: this.queryByHook('submit'),
      caption: 'Submit',
      block: true,
      type: 'primary',
      style: 'slide-right',
      tabindex: 2
    })
    this.listenTo(this.submitButton, 'submit', this.handleFormSubmitted)
  },

  handleFormSubmitted: function handleFormSubmitted () {
    var that = this
    console.log('Submitting feedback...')
    var message = this.query('textarea').value
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
        app.navigate('/')
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
