var config = require('config')
var MongoModel = require('app/models/mongo-model')

exports.Model = MongoModel.extend({
  urlRoot: config.api.url + '/user',

  props: {
    name: 'string',
    email: 'string',
    email_confirmed: 'boolean',
    password: 'string'
  },

  session: {
    token: 'string'
  }
})
