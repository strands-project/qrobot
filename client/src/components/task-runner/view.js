var AmpersandView = require('ampersand-view')

var TaskView = require('./task-view')

module.exports = AmpersandView.extend({
  template: '<ul class="fa-ul task-list"></ul>',

  render: function render () {
    this.renderWithTemplate(this)
    this.renderCollection(this.model.tasks, TaskView, 'ul')
    return this
  }
})
