const View = require('ampersand-view')

module.exports = View.extend({
  template: '<div>This is an object show</div>',
  initialize: function () {
    console.log('{ObjectsShow} initialize')
  }
})
