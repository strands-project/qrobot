var config = require('config')
var MongoModel = require('app/models/mongo-model')

exports.Model = MongoModel.extend({
  url: config.api.url + '/question/answer',

  props: {
    question_id: {
      type: 'string',
      required: 'true'
    },
    user_id: {
      type: 'string',
      required: 'true'
    },
    duration: {
      type: 'number'
    },
    labels: 'array'
  }
})
