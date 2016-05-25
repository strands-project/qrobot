var $ = require('jquery')
var AmpersandCollection = require('ampersand-collection')
var AmpersandModel = require('ampersand-model')
var AmpersandView = require('ampersand-view')
var dom = require('ampersand-dom')

var ImageModel = AmpersandModel.extend({
  props: {
    src: 'string'
  }
})

var ImageView = AmpersandView.extend({
  template: '<div class="item"><img></img></div>',

  bindings: {
    'model.src': {
      type: 'attribute',
      selector: 'img',
      name: 'src'
    }
  },

  render: function render () {
    this.renderWithTemplate(this)
    if (ImageView.instances++ === 0) {
      dom.addClass(this.el, 'active')
    }
  }
})

var IndicatorView = AmpersandView.extend({
  template: '<li data-target="#carousel"></li>',

  render: function render () {
    this.renderWithTemplate(this)
    dom.setAttribute(this.el, 'data-slide-to', IndicatorView.instances)
    if (IndicatorView.instances++ === 0) {
      dom.addClass(this.el, 'active')
    }
  }
})

ImageView.instances = 0
IndicatorView.instances = 0

module.exports = AmpersandView.extend({
  template: require('./template.jade'),

  props: {
    cycle: ['boolean', true, true]
  },

  bindings: {
    'cycle': {
      type: 'switchAttribute',
      selector: '.carousel',
      name: 'data-ride',
      cases: {
        true: 'carousel'
      }
    }
  },

  collections: {
    images: AmpersandCollection.extend({ model: ImageModel })
  },

  initialize: function initialize (spec) {
    this.interval = spec.interval || 2000
    this.listenTo(this.images, 'reset', function () {
      ImageView.instances = 0
      IndicatorView.instances = 0
    })
    this.listenTo(this, 'change:cycle', this.handleCycleChanged)
  },

  render: function render () {
    this.renderWithTemplate(this)
    this.itemsView = this.renderCollection(this.images, ImageView, this.query('.carousel-inner'))
    this.indicatorsView = this.renderCollection(this.images, IndicatorView, this.query('.carousel-indicators'))
    $('.carousel').carousel({
      interval: this.interval
    })
    return this
  },

  handleCycleChanged: function handleCycleChanged () {
    if (this.cycle) {
      $('.carousel').carousel('cycle')
    } else {
      $('.carousel').carousel('pause')
    }
  }
})
