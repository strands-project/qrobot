var app = require('ampersand-app')
var AmpersandModel = require('ampersand-model')

module.exports = AmpersandModel.extend({
  props: {
    _id: {
      type: 'string',
      required: true,
      allowNull: false,
      setOnce: true
    }
  },

  idAttribute: '_id',

  ajaxConfig: function () {
    return { headers: app.getAuthHeader() }
  }
})
