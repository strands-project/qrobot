var animateCss = require('animate.css-js')
var AmpersandView = require('ampersand-view')

module.exports = AmpersandView.extend({
  template: require('./template.jade'),

  autoRender: true,

  props: {
    message: 'string'
  },

  bindings: {
    message: {
      type: 'text',
      selector: 'span'
    }
  },

  initialize: function initialize (spec) {
    this.showAnimation = spec.showAnimation || 'fadeInDown'
  },

  render: function render () {
    this.renderWithTemplate(this)
    animateCss.show(this.el, { animationName: this.showAnimation })
    return this
  }
})
