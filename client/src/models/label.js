var AmpersandCollection = require('ampersand-collection')
var AmpersandModel = require('ampersand-model')

exports.Model = AmpersandModel.extend({
  props: {
    name: 'string'
  },

  session: {
    selected: ['boolean', true, false]
  },

  idAttribute: 'name'
})

exports.Collection = AmpersandCollection.extend({
  model: exports.Model,

  contains: function contains (label) {
    return this.models.find(function (element) {
      // TODO case insensitive
      return element.name === label
    })
  }
})
