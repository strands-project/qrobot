var AmpersandModel = require('ampersand-model')

module.exports = AmpersandModel.extend({
  props: {
    description: 'string',

    message: 'string',

    state: {
      type: 'string',
      values: ['pending', 'active', 'succeeded', 'failed'],
      default: 'pending'
    }
  },

  initialize: function initialize (spec) {
    spec = (spec || {})
    this.fn = spec.fn || function (callback) {
      callback(null)
    }
  }
})
