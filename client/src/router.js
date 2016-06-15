var _ = require('lodash')
var app = require('ampersand-app')
var AmpersandRouter = require('ampersand-router')

module.exports = AmpersandRouter.extend({
  pages: {
    profile: require('./pages/profile'),
    login: require('./pages/login'),
    signup: require('./pages/signup'),
    confirm: require('./pages/confirm'),
    objects: require('./pages/objects'),
    questions: require('./pages/questions')
  },

  routes: {
    '': 'profile.home',
    'login': 'login',
    'signup': 'signup',
    'user/confirm/:token': 'confirm',
    'question': 'questions',
    '(*path)': 'profile'
  },

  initialize: function initRouter (options) {
    this.on('route', this.doRoute.bind(this))
  },

  doRoute: function doRoute (route, params) {
    var r = route + (params && params.length > 1 ? (' / ' + params) : '')
    console.log('Route → ' + r)
    var parts = route.split('.')
    var Page = this.pages[parts[0]]
    if (Page.prototype.requiresLogin && !app.me) {
      console.log('Login required, redirecting...')
      this.redirect = [route, params]
      this.doRoute('login.redirect')
      return
    }
    app.trigger('newPage', new Page(params), parts[1])
  },

  navigate: function navigate (path, options) {
    var redirect = this.redirect
    delete this.redirect

    if (typeof path !== 'undefined') {
      this.history.navigate(path, _.defaultsDeep(options, { trigger: true }))
    } else {
      if (redirect) {
        this.doRoute(redirect[0], redirect[1])
      } else {
        this.history.navigate('/')
      }
    }
  }
})
