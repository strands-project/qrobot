var AmpersandView = require('ampersand-view')
var getSize = require('get-size')
var _ = require('lodash')
var raf = require('raf')
var now = require('right-now')
var THREE = require('three')
var PCDLoader = require('three-pcd-loader')
var TrackballControls = require('three-trackball-controls')(THREE)

module.exports = AmpersandView.extend({
  template: '<canvas/>',

  props: {
    uri: 'string',
    spin: ['boolean', true, true]
  },

  initialize: function initialize (userOptions) {
    var defaultOptions = {
      clearColor: 0xe0e0e0,
      fov: 50,
      near: 0.05,
      far: 100,
      width: 100,
      height: 100
    }
    if (userOptions !== undefined && userOptions.width && userOptions.height) {
      defaultOptions.responsive = false
      defaultOptions.aspect = userOptions.width / userOptions.height
    } else {
      defaultOptions.responsive = true
      defaultOptions.aspect = 1.0
    }
    this.options = _.defaultsDeep(userOptions, defaultOptions)

    this.running = false
    this.last = now()
    this._frame = 0
    this._tick = this.tick.bind(this)

    this.loader = new PCDLoader()
    THREE.Cache.enabled = true
  },

  render: function render () {
    this.renderWithTemplate(this)
    this.cacheElements({
      canvas: 'canvas'
    })

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas
    })
    var options = this.options
    this.renderer.setSize(options.width, options.height)
    this.renderer.setClearColor(options.clearColor)
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(options.fov, options.width / options.height, options.near, options.far)
    this.camera.position.z = 1
    this.controls = new TrackballControls(this.camera, this.canvas)
    this.controls.rotateSpeed = 2.0

    this.listenTo(this, 'change:uri', function () {
      this.loadPCD(this.uri)
    })

    this.start()

    return this
  },

  start: function start () {
    if (!this.running) {
      this.running = true
      this.last = now()
      this._frame = raf(this._tick)
    }
    return this
  },

  stop: function stop () {
    this.running = false
    if (this._frame !== 0) {
      raf.cancel(this._frame)
    }
    this._frame = 0
    return this
  },

  reset: function reset () {
    if (this.mesh) {
      this.scene.remove(this.mesh)
      delete this.mesh
    }
    this.controls.reset()
  },

  loadPCD: function loadPCD (uri) {
    var self = this
    console.log('Loading ' + uri)
    this.loader.load(uri, function onLoad (mesh) {
      console.log('Model "' + uri + '" loaded')
      mesh.lookAt(new THREE.Vector3(0, 1, 0))
      mesh.geometry.computeBoundingBox()
      var center = mesh.geometry.boundingBox.center()
      mesh.geometry.translate(-center.x, -center.y, -center.z)

      if (self.mesh) {
        self.scene.remove(self.mesh)
      }
      self.mesh = mesh
      self.scene.add(self.mesh)
    }, function (xhr) {
      var p = 100 * xhr.loaded / xhr.total
      console.log('Loading: ' + p.toFixed(0) + '%')
    })
    return this
  },

  tick: function tick () {
    if (this.options.responsive) {
      var parentSize = getSize(this.canvas.parentNode)
      if (parentSize && parentSize.innerWidth !== this.canvas.width) {
        this.resize(parentSize.innerWidth, parentSize.innerWidth / this.options.aspect)
      }
    }

    if (this.spin && this.mesh) {
      this.mesh.rotation.z += 0.02
    }

    this._frame = raf(this._tick)
    var time = now()
    var delta = time - this.last
    this.trigger('tick', delta)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.last = time
    return this
  },

  resize: function resize (width, height) {
    this.canvas.width = width
    this.canvas.height = height
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.controls.handleResize()
    return this
  }
})
