const fs = require('fs')
const path = require('path')

/**
 * @var {string} validationsPathDefault - The default path to the validations
 * directory.
 */
module.exports.validationsPathDefault = path.resolve(path.join(__dirname, '..',
  'validations'))

/**
 * @var {string} patchesPathDefault - The default path to the patches
 * directory.
 */
module.exports.patchesPathDefault = path.resolve(path.join(__dirname, '..',
  'patches'))

/**
 * Patches the argument model with validations and logic model patches, if any
 * of these patches is present in the respective directories.
 *
 * @param {object} model- The instantiated (already required) model
 * @param {string} modelFile - The valid path to the model file
 * @param {string} validationsPath - The valid path to the validations
 * directory.If undefined the module 's default will be used.
 * @param {string} patchesPath - The valid path to the patches directory. If
 * undefined this module's default will be used.
 *
 * @return {object} The patched argument model
 */
module.exports.patchModel = function({
  model,
  modelFile,
  validationsPath,
  patchesPath
}) {
  if (undefined === validationsPath) {
    validationsPath = module.exports.validationsPathDefault
  }
  let validatorPatcher = path.resolve(path.join(validationsPath,
    modelFile))
  if (fs.existsSync(validatorPatcher)) {
    model = require(validatorPatcher).validator_patch(model)
  }

  if (undefined === patchesPath) {
    patchesPath = module.exports.patchesPathDefault
  }
  let logicPatcher = path.resolve(path.join(patchesPath, modelFile))
  if (fs.existsSync(logicPatcher)) {
    model = require(logicPatcher).logic_patch(model)
  }
  return model
}

/**
 * Requires, patches, and checks for duplicity all model files in the argument
 * directory and adds them to the argument 'modelsIndex'.
 *
 * @param {string} modelsDir - The directory in which to find the respective
 * model files. Typically these are models stored in the same type of database
 * (relational DB, Cassandra, Web-Services, ...)
 * @param {object} modelsIndex - The object in which the respective required
 * models are held as its properties.
 * @param {function} requireFunk - The function invoked to require the
 * respective model-files. If undefined 'require' is used. 
 *
 * @return {object} The modified argument 'modelsIndex'
 */
module.exports.requireModels = function({
  modelsDir,
  modelsIndex,
  requireFunk
}) {
  if (undefined === requireFunk) {
    requireFunk = require
  }
  fs.readdirSync(modelsDir)
    .filter(function(file) {
      return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(
        -3) === '.js')
    })
    .forEach(function(file) {
      console.log(`Requiring model-file: ${file}`)
      let model = requireFunk(path.resolve(path.join(modelsDir, file)))

      model = module.exports.patchModel({
        model: model,
        modelFile: file
      })

      if (modelsIndex[model.name])
        throw Error(`Duplicated model name ${model.name}`)

      modelsIndex[model.name] = model

    })
  return modelsIndex
}
