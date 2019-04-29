const requestlib = require('request')

/**
 * @classdesc Wrapper for using https://www.npmjs.com/package/request to be more testable
 */
class Request {

  /**
   * Wrapped HTTP request method, using https://www.npmjs.com/package/request
   *
   * @param {Object} options see https://www.npmjs.com/package/request for more info on options
   * @param {Function} callback
   */
  request (options, callback) {
    return new Promise((resolve, reject) => {
      requestlib(options, (error, response, body) => {
        const result = callback(error, response, body)
        if (result === true) {
          return resolve({response, body})
        }
        return reject(result)
      })
    })
  }

}

module.exports = Request
