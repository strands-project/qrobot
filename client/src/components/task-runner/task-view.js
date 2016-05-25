var AmpersandView = require('ampersand-view')

module.exports = AmpersandView.extend({
  template: require('./task-template.jade'),

  autoRender: true,

  derived: {
    textClass: {
      deps: ['model.state'],
      fn: function () {
        switch (this.model.state) {
          case 'active': return 'text-primary'
          case 'succeeded': return 'text-success'
          case 'failed': return 'text-danger'
          default: return ''
        }
      }
    },

    iconClass: {
      deps: ['model.state'],
      fn: function () {
        switch (this.model.state) {
          case 'pending': return 'fa-circle-o'
          case 'active': return ['fa-circle-o-notch', 'fa-spin']
          case 'succeeded': return 'fa-check-circle'
          case 'failed': return 'fa-minus-circle'
        }
      }
    }
  },

  bindings: {
    'model.description': {
      hook: 'description'
    },

    'model.message': {
      hook: 'message'
    },

    'textClass': {
      type: 'class'
    },

    'iconClass': {
      type: 'class',
      selector: 'i'
    }
  }
})
