var _ = require('lodash')
var AmpersandView = require('ampersand-view')
var dom = require('ampersand-dom')
var Ladda = require('ladda')

module.exports = AmpersandView.extend({
  template: '<a class="btn"><div class="ladda-button"></div></a>',

  autoRender: true,

  props: {
    caption: 'string',
    type: {
      type: 'string',
      values: ['danger', 'warning', 'info', 'success', 'primary', 'default', 'link'],
      default: 'default'
    },
    block: ['boolean', 'false', 'false'],
    style: {
      type: 'string',
      values: ['expand-left', 'expand-right', 'expand-up', 'expand-down',
               'contract', 'contract-overlay', 'zoom-in', 'zoom-out', 'slide-left',
               'slide-right', 'slide-up', 'slide-down'],
      default: 'expand-left'
    },
    tabindex: ['number', true, 0]
  },

  derived: {
    contextualClass: {
      deps: ['type'],
      fn: function () {
        return 'btn-' + this.type
      }
    }
  },

  bindings: {
    'caption': {
      type: 'text',
      selector: 'div'
    },
    'block': {
      type: 'booleanClass',
      name: 'btn-block'
    },
    'style': {
      type: 'attribute',
      name: 'data-style',
      selector: 'div'
    },
    'tabindex': {
      type: 'attribute',
      name: 'tabindex'
    }
  },

  events: {
    'click': 'handleClick',
    'keydown': 'handleClick'
  },

  initialize: function initialize (spec) {
    this.listenTo(this, 'change:contextualClass', this.handleContextualClassChanged)
  },

  render: function render () {
    this.renderWithTemplate(this)
    this.ladda = Ladda.create(this.query('div'))
    dom.addClass(this.el, this.contextualClass)
    return this
  },

  start: function start (xhr) {
    this.ladda.start()
    if (xhr && typeof xhr['always'] === 'function') {
      xhr.always(_.bind(this.ladda.stop, this.ladda))
    }
  },

  stop: function stop () {
    this.ladda.stop()
  },

  handleContextualClassChanged: function handleContextualClassChanged (view, newClass) {
    var oldClass = view.previousAttributes().contextualClass
    dom.switchClass(this.el, oldClass, newClass)
  },

  handleClick: function (event) {
    // handleSumbit expects an instance of "submit" event, but we do not have it
    if (event.type === 'keydown' && event.which !== 13) return
    this.trigger('submit', event)
  }
})
