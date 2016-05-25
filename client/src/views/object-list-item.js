var AmpersandView = require('ampersand-view')

module.exports = AmpersandView.extend({
  template: "<tr><td data-hook='id'></td><td data-hook='label'></td></tr>",
  autoRender: true,

  events: {
    'click': 'handleClick'
  },

  bindings: {
    'model._id': { hook: 'id' },
    'model.label': { hook: 'label' },

    'model.selected': {
      type: 'booleanClass',
      name: 'info'
    }
  },

  handleClick: function (e) {
    this.model.selected = !this.model.selected
  }
})
