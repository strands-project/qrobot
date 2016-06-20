var AmpersandView = require('ampersand-view')

module.exports = AmpersandView.extend({
  template: require('./template.jade'),

  autoRender: true,

  props: {
    heading: 'string',
    details: 'string',
    icon: 'string',
    type: {
      type: 'string',
      values: ['danger', 'warning', 'info', 'success', 'default'],
      default: 'default'
    }
  },

  derived: {
    contextualClass: {
      deps: ['type'],
      fn: function () {
        return 'widget-' + this.type
      }
    },

    iconClass: {
      deps: ['icon'],
      fn: function () {
        return 'fa-' + this.icon
      }
    }
  },

  bindings: {
    'heading': {
      type: 'text',
      hook: 'heading'
    },

    'details': {
      type: 'innerHTML',
      hook: 'details'
    },

    'contextualClass': {
      type: 'class'
    },

    'iconClass': {
      type: 'class',
      selector: 'i'
    }
  },

  render: function render () {
    this.renderWithTemplate(this)
    return this
  }
})
