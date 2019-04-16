const fs = require('fs');
const path = require('path');

/**
 * Patches the argument model with validations and logic model patches, if any
 * of these patches is present in the respective directories.
 *
 * @param {object} model- The instantiated (already required) model
 * @param {string} modelFile - The valid path to the model file
 *
 * @return {object} The patched argument model
 */
module.exports.patchModel = function({
    model,
    modelFile
  }) {
    let validator_patch = path.join('./validations', modelFile);
    if (fs.existsSync(validator_patch)) {
      model = require(`./${validator_patch}`).validator_patch(model);
    }

    let patches_patch = path.join('./patches', modelFile);
    if (fs.existsSync(patches_patch)) {
      model = require(`./${patches_patch}`).logic_patch(model);
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
