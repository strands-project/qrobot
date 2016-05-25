var animateCss = require('animate.css-js')
var AmpersandView = require('ampersand-view')
var dom = require('ampersand-dom')

module.exports = AmpersandView.extend({
  template: require('./template.jade'),

  autoRender: true,

  props: {
    message: 'string',
    visible: ['boolean', true, false],
    type: {
      type: 'string',
      values: ['danger', 'warning', 'info', 'success'],
      default: 'danger'
    }
  },

  derived: {
    contextualClass: {
      deps: ['type'],
      fn: function () {
        return 'alert-' + this.type
      }
    }
  },

  bindings: {
    'message': {
      type: 'text',
      selector: 'span'
    }
  },

  events: {
    'click button': 'handleCloseButtonClick'
  },

  initialize: function initialize (spec) {
    this.showAnimation = spec.showAnimation || 'flipInX'
    this.hideAnimation = spec.hideAnimation || 'flipOutX'
    this.listenTo(this, 'change:visible', this.handleVisibleChanged)
    this.listenTo(this, 'change:contextualClass', this.handleContextualClassChanged)
  },

  render: function render () {
    this.renderWithTemplate(this)
    dom.addClass(this.el, this.contextualClass)
    if (!this.visible) {
      dom.addClass(this.el, 'hidden')
    }
    return this
  },

  show: function show () {
    animateCss.show(this.el, { animationName: this.showAnimation })
  },

  hide: function hide () {
    animateCss.hide(this.el, { animationName: this.hideAnimation })
  },

  handleVisibleChanged: function handleVisibleChanged () {
    if (this.visible) {
      this.show()
    } else {
      this.hide()
    }
  },

  handleContextualClassChanged: function handleContextualClassChanged (view, newClass) {
    var oldClass = view.previousAttributes().contextualClass
    dom.switchClass(this.el, oldClass, newClass)
  },

  handleCloseButtonClick: function handleCloseButtonClick () {
    this.visible = false
  }
})
