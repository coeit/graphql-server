const AWS = require('aws-sdk')
const path = require('path')
const s3Settings = require(path.join(__dirname, '..', 'config', 'minio.json'))

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
