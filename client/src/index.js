var app = require('ampersand-app')
var domReady = require('domready')
var _ = require('lodash')
var pace = require('pace')

var MainView = require('app/views/main-view')
var Router = require('app/router')
var Storage = require('app/storage')
var User = require('app/models/user')

require('animate.css/animate.css')
require('ladda/dist/ladda-themeless.min.css')
require('pace/themes/blue/pace-theme-flash.css')
require('app/styles/main.scss')

pace.start()
window.app = app

app.extend({
  init: function init () {
    console.log('Application initialization')

    this.view = new MainView({
      template: require('./templates/body.jade')
    })

    this.router = new Router()
    this.storage = new Storage()

    this.once('auth', _.bind(function () {
      this.router.history.start({ pushState: true })
    }, this))

    this.auth()
  },

  auth: function auth (token) {
    var that = this

    var fetchUser = function (token) {
      if (token) {
        var user = new User.Model()
        user.fetch({
          success: function () {
            console.log('Token is valid, logged in as', user.name)
            that.me = user
            that.trigger('auth')
          },
          error: function () {
            console.log('Token is invalid')
            that.trigger('auth')
          }
        })
      } else {
        that.trigger('auth')
      }
    }

    if (token) {
      this.storage.set('token', token)
      fetchUser(token)
    } else {
      this.storage.get('token', fetchUser)
    }
  },

  getAuthHeader: function getAuthHeader () {
    if ('token' in window.sessionStorage) {
      return { 'Authorization': 'JWT ' + window.sessionStorage.token }
    }
    return { }
  },

  navigate: function navigate (where) {
    this.view.modal.hide()
    this.router.navigate(where)
  }
})

domReady(_.bind(app.init, app))
