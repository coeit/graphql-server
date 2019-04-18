const path = require('path')
const requireModelsHelper = require(path.join(__dirname, 'utils',
  'require-models-helper.js'))
sequelize = require('./connection')

var models = {}

// IMPORT SEQUELIZE models
requireModelsHelper.requireModels({
  modelsDir: path.resolve('models'),
  modelsIndex: models,
  requireFunk: function(filePath) {
    return sequelize['import'](filePath)
  }
})
// Important: creates associations based on associations defined in associate
// function in the model files
Object.keys(models).forEach(function(modelName) {
  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
})

// IMPORT WEBSERVICES models
requireModelsHelper.requireModels({
  modelsDir: path.resolve('models-webservice'),
  modelsIndex: models
})

// IMPORT CASSANDRA models
requireModelsHelper.requireModels({
  modelsDir: path.resolve('models-cassandra'),
  modelsIndex: models
})

module.exports = models
