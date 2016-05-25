var AmpersandCollection = require('ampersand-rest-collection')

var config = require('config')
var MongoModel = require('app/models/mongo-model')

exports.Model = MongoModel.extend({
  urlRoot: config.api.url + '/question',

  props: {
    created: 'date',
    soma_id: 'string',
    point_cloud_id: 'string',
    image_ids: 'array',
    suggested_labels: 'array'
  },

  derived: {
    point_cloud_uri: {
      deps: ['point_cloud_id'],
      fn: function () {
        return config.api.url + '/file/pcd/' + this.point_cloud_id
      }
    }
  }
})

exports.Collection = AmpersandCollection.extend({
  model: exports.Model,
  url: config.api.url + '/question/'
})
