const AWS = require('aws-sdk')
const path = require('path')
const s3Settings = require(path.join(__dirname, '..', 'config', 'minio.json'))
const Joi = require('joi')

/**
 * @constant {object} The initialized AWS.S3 instance, the connection to the
 * Minio server.
 */
module.exports.s3 = new AWS.S3(s3Settings)

/**
 * Uses Amazon's aws-sdk to connect to the registered Minio server and test
 * whether the argument bucket and file exist. The function used to test for
 * the file's existance is headObject(...).
 *
 * @param {string} bucket - The name of the bucket in which to lookup the
 * argument file.
 * @param {string} file - The name of the file to lookup within the argument
 * bucket.
 *
 * @return {object} If the function headObject(...) throws an error false is
 * returned otherwise true is returned.
 */
module.exports.fileExists = async function(bucket, file) {
  try {
    const headCode = await module.exports.s3.headObject({
      Bucket: bucket,
      Key: file
    }).promise()
    return true
  } catch (e) {
    return false
  }
}

/**
 * @constant {object} An extended version of Joi including a validator for a
 * Minio-URL checking if the file indicated by the URL truly exists.
 */
module.exports.joiMinioUrlFileExists = Joi.extend((joi) => ({
  base: joi.string(),
  name: 'string',
  language: {
    minioUrlFileExist: 'Minio File must exist in Bucket defined by the URL.',
  },
  rules: [{
    name: 'minioUrlFileExist',
    async validate(params, value, state, options) {

      let regMatches = value.match(/([^/]+)\/([^/]+)\/([^/]+)$/)
      let minioUrl, minioBucket, minioFileName
      if (regMatches !== null) {
        minioUrl = regMatches[1]
        minioBucket = regMatches[2]
        minioFileName = regMatches[3]
      }
      if (null === regMatches || module.exports.s3.endpoint.host !==
        minioUrl || !module.exports
        .fileExists(minioBucket, minioFileName)) {
        // Generate an error, state and options need to be passed
        return this.createError('string.minioUrlFileExist', {
          v: value
        }, state, options);
      }

      return value; // Everything is OK
    }
  }]
}))
