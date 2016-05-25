var $ = require('jquery')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')
var AmpersandFormView = require('ampersand-form-view')
var AmpersandInputView = require('ampersand-input-view')

var config = require('config')
var Alert = require('app/components/alert')
var Ladda = require('app/components/ladda')

module.exports = AmpersandView.extend({
  pageTitle: 'Log in',
  withNavbar: false,

  template: require('app/templates/login.jade'),

  initialize: function initialize () {
    // Wipe all user information -- effectively log out
    delete app.me
    delete window.sessionStorage.token
  },

  render: function () {
    var that = this
    this.renderWithTemplate(this)
    this.loginButton = new Ladda.View({
      el: this.queryByHook('login'),
      caption: 'Log in',
      block: true,
      type: 'primary',
      style: 'slide-right',
      tabindex: 3
    })
    this.listenTo(this.loginButton, 'submit', this.handleLoginSubmitted)
    this.alert = new Alert.View({ el: this.queryByHook('alert') })
    this.form = new AmpersandFormView({
      autoRender: true,
      el: this.query('fieldset'),
      fields: function () {
        return [
          new AmpersandInputView({
            label: 'E-mail',
            placeholder: 'E-mail address',
            name: 'email',
            required: true,
            autofocus: true,
            parent: this,
            tabindex: 1,
            validClass: '',
            invalidClass: 'has-error',
            validityClassSelector: 'div.form-group',
            template: require('app/templates/form-input.jade')
          }),
          new AmpersandInputView({
            label: 'Password',
            placeholder: 'Password',
            name: 'password',
            type: 'password',
            required: true,
            parent: this,
            tabindex: 2,
            validClass: '',
            invalidClass: 'has-error',
            validityClassSelector: 'div.form-group',
            template: require('app/templates/form-input.jade')
          })
        ]
      },
      submitCallback: function (data) {
        console.log('Authenticating...')
        var xhr = $.ajax(config.api.url + '/auth', {
          method: 'POST',
          data: JSON.stringify(data),
          contentType: 'application/json'
        }).fail(function (xhr, status, err) {
          if (err === 'UNAUTHORIZED') {
            that.alert.set({
              message: 'Invalid e-mail or password',
              type: 'danger',
              visible: true
            })
          }
        }).done(function (data) {
          console.log('Authentication succeeded, fetching user data')
          app.once('auth', app.navigate.bind(app))
          app.auth(data['token'])
        })
        that.loginButton.start(xhr)
      }
    })
    this.registerSubview(this.form)
    return this
  },

  // Actions

  redirect: function () {
    this.alert.set({
      message: 'Please log in to access this page',
      type: 'warning',
      visible: true
    })
  },

  // Handlers

  handleLoginSubmitted: function (event) {
    // handleSumbit expects an instance of "submit" event, but we do not have it
    var dummyEvent = { preventDefault: function () { } }
    this.form.handleSubmit(dummyEvent)
  }
})
