var AmpersandView = require('ampersand-view')

var ThreeViewer = require('app/three/three-viewer')

module.exports = AmpersandView.extend({
  template: '<canvas/>',

  render: function () {
    console.log('{Object} render')
    this.renderWithTemplate(this)
    this.threeViewer = new ThreeViewer({
      canvas: this.query('canvas')
    })
    this.threeViewer.loadPCD(this.model.name)
    this.threeViewer.start()
    this.model.on('change:name', this.reloadModel.bind(this))
    return this
  },

  reloadModel: function () {
    this.threeViewer.loadPCD(this.model.name)
  }
})
