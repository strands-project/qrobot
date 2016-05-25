var $ = require('jquery')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')
var AmpersandFormView = require('ampersand-form-view')
var AmpersandInputView = require('ampersand-input-view')
var email = require('email-addresses')
var PasswordChecker = require('password-checker')

var config = require('config')
var Alert = require('app/components/alert')
var Ladda = require('app/components/ladda')
var User = require('app/models/user')

module.exports = AmpersandView.extend({
  pageTitle: 'Sign up',
  withNavbar: false,

  template: require('app/templates/signup.jade'),

  initialize: function initialize () {
    this.user = new User.Model()
    this.checker = new PasswordChecker()
    this.checker.min_length = 8
    this.checker.requireLetters(true)
    this.checker.requireNumbersOrSymbols(true)
  },

  render: function render () {
    var that = this
    this.renderWithTemplate(this)
    this.signupButton = new Ladda.View({
      el: this.queryByHook('signup'),
      caption: 'Sign up',
      block: true,
      type: 'primary',
      style: 'slide-right',
      tabindex: 4
    })
    this.listenTo(this.signupButton, 'submit', this.handleSignupSubmitted)
    this.alert = new Alert.View({ el: this.queryByHook('alert') })
    this.form = new AmpersandFormView({
      autoRender: true,
      el: this.query('fieldset'),
      model: this.user,
      fields: function () {
        return [
          new AmpersandInputView({
            label: 'E-mail',
            placeholder: 'E-mail address',
            name: 'email',
            value: this.model.email || '',
            required: false,  // the length is checked anyway
            parent: this,
            autofocus: true,
            tabindex: 1,
            validClass: '',
            invalidClass: 'has-error',
            validityClassSelector: 'div.form-group',
            template: require('app/templates/form-input.jade'),
            tests: [
              function (value) {
                if (!email.parseOneAddress(value)) {
                  return 'Invalid e-mail address'
                }
              }
            ]
          }),
          new AmpersandInputView({
            label: 'Password',
            placeholder: 'Password',
            name: 'password',
            type: 'password',
            required: false,  // the length is checked anyway
            parent: this,
            tabindex: 2,
            validClass: '',
            invalidClass: 'has-error',
            validityClassSelector: 'div.form-group',
            template: require('app/templates/form-input.jade'),
            tests: [
              function (value) {
                if (!that.checker.check(value)) {
                  return that.checker.errors[0].message
                }
              }
            ]
          }),
          new AmpersandInputView({
            label: 'Name',
            placeholder: 'Name',
            name: 'name',
            value: this.model.name || '',
            required: true,
            requiredMessage: 'This field is required',
            parent: this,
            tabindex: 3,
            validClass: '',
            invalidClass: 'has-error',
            validityClassSelector: 'div.form-group',
            template: require('app/templates/form-input.jade')
          })
        ]
      },
      submitCallback: function (data) {
        console.log('Sending new user data to the server...')
        var xhr = $.ajax(config.api.url + '/user', {
          method: 'POST',
          data: JSON.stringify(data),
          contentType: 'application/json'
        }).fail(function (xhr, status, err) {
          that.alert.set({
            message: 'Something went wrong',
            type: 'danger',
            visible: true
          })
        }).done(function (data) {
          if (data.status === 'success') {
            app.once('auth', app.navigate.bind(app, 'welcome'))
            app.auth(data.token)
          } else {
            that.alert.set({
              message: data.message,
              type: 'danger',
              visible: true
            })
          }
        })
        that.signupButton.start(xhr)
      }
    })
    this.registerSubview(this.form)
    this.registerSubview(this.alert)
    return this
  },

  handleSignupSubmitted: function (event) {
    // handleSumbit expects an instance of "submit" event, but we do not have it
    var dummyEvent = { preventDefault: function () { } }
    this.form.handleSubmit(dummyEvent)
  }
})
