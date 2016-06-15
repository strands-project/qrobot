var AmpersandView = require('ampersand-view')

module.exports = AmpersandView.extend({
  pageTitle: 'Welcome to QRobot',
  requiresLogin: false,

  template: require('app/templates/landing.jade')
})
