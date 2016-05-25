var $ = require('jquery')
var _ = require('lodash')
var AmpersandView = require('ampersand-view')

module.exports = AmpersandView.extend({
  template: require('./template.jade'),

  autoRender: true,

  props: {
    title: 'string',
    visible: ['boolean', true, false],
    animated: ['boolean', true, true],
    size: {
      type: 'string',
      values: ['small', 'default', 'large'],
      default: 'default'
    }
  },

  derived: {
    contextualClass: {
      deps: ['size'],
      fn: function () {
        console.log('Modal size: ' + this.size)
        switch (this.size) {
          case 'small': return 'modal-sm'
          case 'large': return 'modal-lg'
          default: return ''
        }
      }
    }
  },

  bindings: {
    'title': [
      {
        type: 'toggle',
        selector: '.modal-header'
      },
      {
        type: 'text',
        selector: '.modal-title'
      }
    ],
    'animated': {
      type: 'booleanClass',
      name: 'fade'
    },
    'contextualClass': {
      type: 'class',
      selector: '.modal-dialog'
    }
  },

  initialize: function initialize (spec) {
    this.spec = _.defaultsDeep(spec, {
      backdrop: true,
      keyboard: true
    })
    this.listenTo(this, 'change:visible', this.handleVisibleChanged)
  },

  render: function render () {
    var that = this
    this.renderWithTemplate(this)
    this.element = $(this.el).modal({
      show: this.visible,
      backdrop: this.spec.backdrop,
      keyboard: this.spec.keyboard
    })
    this.element.on('hide.bs.modal', function (e) {
      that.set({ visible: false }, { silent: true })
    })
    this.element.on('show.bs.modal', function (e) {
      that.set({ visible: true }, { silent: true })
    })
    return this
  },

  show: function show (view, title) {
    if (this.subview) {
      this.subview.remove()
    }
    this.renderSubview(view, '[data-hook=content]')
    this.subview = view
    this.title = title || ''
    this.visible = true
  },

  hide: function hide () {
    this.visible = false
  },

  handleVisibleChanged: function handleVisibleChanged () {
    if (this.visible) {
      this.element.modal('show')
    } else {
      this.element.modal('hide')
    }
  }
})
