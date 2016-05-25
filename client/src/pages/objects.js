var AmpersandView = require('ampersand-view')

var Object_ = require('app/models/object')
var ObjectListItemView = require('app/views/object-list-item.js')
var ThreeViewer = require('app/three/three-viewer')
var config = require('config')

module.exports = AmpersandView.extend({
  pageTitle: 'Objects',
  withNavbar: true,

  template: require('app/templates/objects.jade'),

  session: {
    mode: {
      type: 'string',
      values: [
        'all',
        'labelled',
        'unlabelled'
      ]
    }
  },

  subviews: {
    viewer: {
      hook: 'viewer',
      prepareView: function (el) {
        return new ThreeViewer({
          aspect: 2,
          el: el
        })
      }
    }
  },

  bindings: {
    mode: {
      type: 'switchClass',
      name: 'active',
      cases: {
        'all': '[data-hook=mode-pills] #all',
        'labelled': '[data-hook=mode-pills] #labelled',
        'unlabelled': '[data-hook=mode-pills] #unlabelled'
      }
    }
  },

  collections: {
    objects: Object_.Collection
  },

  initialize: function initialize () {
    this.objects.fetch()
    if (!this.objects.length) {
      // fetch objects list from server
      // this.objects = new Objects([
        // { id: 'DA0AV6' },
        // { id: 'ZO6GP6' },
        // { id: 'XJ6JH2' },
        // { id: 'YF5VP2' },
        // { id: 'TM2KF7' },
        // { id: 'BS6IO0' },
        // { id: 'GD9XE2' },
        // { id: 'HF1BM6' },
        // { id: 'XZ0KN8' },
        // { id: 'EN3MH9', label: 'router box' }
      // ])
      // this.objects.writeToLocalStorage()
    }
    this.listenTo(this, 'change:mode', this.onModeChanged)
  },

  render: function () {
    this.renderWithTemplate(this)
    this.renderCollection(this.objects.subset, ObjectListItemView, 'tbody')
    this.listenTo(this.objects, 'change:selected', this.selectionChanged.bind(this))
    return this
  },

  selectionChanged: function (item) {
    if (item.selected) {
      this.objects.map(function (object) {
        if (object !== item) {
          object.selected = false
        }
      })
      this.viewer.uri = config.api.url + '/objects/pcd/' + item._id
    }
  },

  onModeChanged: function onModeChanged () {
    if (this.mode === 'all') {
      this.objects.subset.clearFilters()
    } else if (this.mode === 'labelled') {
      this.objects.subset.configure({
        filter: function (m) {
          return m.label
        }
      }, true)
    } else if (this.mode === 'unlabelled') {
      this.objects.subset.configure({
        filter: function (m) {
          return !m.label
        }
      }, true)
    }
  },

  // Subpages
  list: function (filter, query) {
    if (filter === null) {
      filter = 'all'
    }
    console.log('[Objects] list: ' + filter)
    this.mode = filter
  }
})
