var AmpersandCollection = require('ampersand-rest-collection')
var AmpersandFilteredSubcollection = require('ampersand-filtered-subcollection')

var config = require('config')
var MongoModel = require('app/models/mongo-model')

var STORAGE_KEY = 'qrobot-objects'

exports.Model = MongoModel.extend({
  props: {
    label: {
      type: 'string'
    }
  },

  session: {
    selected: 'boolean'
  }
})

exports.Collection = AmpersandCollection.extend({
  model: exports.Model,

  url: config.api.url + '/objects',

  initialize: function initialize () {
    this.subset = new AmpersandFilteredSubcollection(this)
  },

  readFromLocalStorage: function readFromLocalStorage () {
    var existingData = window.localStorage[STORAGE_KEY]
    console.log('Read local storage')
    if (existingData) {
      console.dir(existingData)
      this.set(JSON.parse(existingData))
    }
  },

  writeToLocalStorage: function () {
    window.localStorage[STORAGE_KEY] = JSON.stringify(this)
  }
})
