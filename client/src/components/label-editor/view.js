var AmpersandView = require('ampersand-view')
var dom = require('ampersand-dom')

var Label = require('app/models/label')

var ItemView = AmpersandView.extend({
  template: '<button class="list-group-item"><label data-hook="name"></label><a class="close">&times;</a></button>',

  bindings: {
    'model.name': '[data-hook=name]'
  },

  events: {
    'mouseover': 'showRemoveButton',
    'mouseleave': 'hideRemoveButton',
    'click': 'handleRemoveClick'
  },

  render: function render () {
    this.renderWithTemplate(this)
    this.cacheElements({
      removeButton: '.close'
    })
    dom.hide(this.removeButton)
  },

  // Handlers
  showRemoveButton: function showRemoveButton () {
    dom.show(this.removeButton)
  },

  hideRemoveButton: function hideRemoveButton () {
    dom.hide(this.removeButton)
  },

  handleRemoveClick: function handleRemoveClick () {
    this.model.collection.remove(this.model)
  }
})

module.exports = AmpersandView.extend({
  template: require('./template.jade'),

  collections: {
    labels: Label.Collection
  },

  events: {
    'click [data-hook=label-add]': 'handleAddClick',
    'keyup [data-hook=label-input]': 'handleKeypress'
  },

  render: function render () {
    this.renderWithTemplate(this)
    this.itemsView = this.renderCollection(this.labels, ItemView, this.queryByHook('labels'), { reverse: true })
    this.cacheElements({
      labelInput: '[data-hook=label-input]'
    })
    return this
  },

  // Handlers
  handleAddClick: function handleAddClick () {
    // TODO escape
    var label = this.labelInput.value
    if (label !== '') {
      this.labels.add({ name: label })
      this.labelInput.value = ''
    }
  },

  handleKeypress: function handleKeypress (e) {
    if (e.which === 13) {
      this.handleAddClick()
    }
  }
})