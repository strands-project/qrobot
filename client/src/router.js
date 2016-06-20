var _ = require('lodash')
var app = require('ampersand-app')
var AmpersandRouter = require('ampersand-router')

module.exports = AmpersandRouter.extend({
  pages: {
    index: require('./pages/index'),
    login: require('./pages/login'),
    signup: require('./pages/signup'),
    feedback: require('./pages/feedback'),
    confirm: require('./pages/confirm'),
    questions: require('./pages/questions')
  },

  routes: {
    '': 'index',
    'login': 'login',
    'signup': 'signup',
    'feedback': 'feedback',
    'user/confirm/:token': 'confirm',
    'question': 'questions',
    '(*path)': 'index'
  },

  initialize: function initRouter (options) {
    this.on('route', this.doRoute.bind(this))
  },

  doRoute: function doRoute (route, params) {
    console.log('Route → ' + route)
    var parts = route.split('.')
    var Page = this.pages[parts[0]]
    if (Page.prototype.requiresLogin && !app.me) {
      console.log('Login required, redirecting...')
      this.redirect = [route, params]
      this.doRoute('login.redirect')
      return
    }
    params = this._mergeWithHiddenParams(params)
    app.trigger('newPage', new Page(params), parts[1])
  },

  navigate: function navigate (path, params) {
    this.hiddenParams = params
    var redirect = this.redirect
    delete this.redirect

    if (typeof path !== 'undefined') {
      this.history.navigate(path, { trigger: true })
    } else {
      if (redirect) {
        this.doRoute(redirect[0], redirect[1])
      } else {
        this.history.navigate('/', { trigger: true })
      }
    }
  },

  _mergeWithHiddenParams: function _mergeWithHiddenParams (params) {
    var mergedParams = { }
    if (params) {
      var query = params.pop()
      if (query) mergedParams['query'] = query
      if (params.length) mergedParams['positional'] = params
    }
    if (this.hiddenParams) {
      mergedParams = _.merge(mergedParams, this.hiddenParams)
      delete this.hiddenParams
    }
    for (var key in mergedParams) {
      console.log('        ' + key + ': ' + mergedParams[key])
    }
    return mergedParams
  }
})
