const { send } = require('micro')
const Boom = require('@hapi/boom')

/**
 * Catches error from an async function, wraps them
 * in a Boom error object and generates a JSON response.
 *
 * @param  {Function} fn   Async function, your normal `micro` logic
 * @param  {Boolean}  dump Dumps `err.stack` to `stderr` if true
 * @return {void}
 */
module.exports.handleErrors = function (fn, dump = false) {
  return async function (req, res) {
    try {
      return await fn(req, res)
    } catch (err) {
      // Dump stacktrace if flagged
      if (dump) {
        console.error(err.stack)
      }

      // Determine status code in determined order
      let statusCode = res.statusCode || 500
      if (Boom.isBoom(err)) {
        statusCode = err.output.statusCode
      } else if (err.statusCode) {
        statusCode = err.statusCode
      }

      // Since it's an error, it's safe to assume <400
      // status codes are a mistake.
      if (statusCode < 400) {
        statusCode = 500
      }

      // Wrap the error and generate the response
      const error = Boom.isBoom(err) ? err : Boom.boomify(err, { statusCode })

      // Add WWW-Authenticate challenge to headers for 401 responses
      if (statusCode === 401 && error.data && error.data.challenge) {
        res.setHeader('WWW-Authenticate', error.data.challenge)
      }

      send(
        res,
        statusCode,
        Object.assign({},
          error.output.payload,
          error.data && { data: error.data }
        )
      )
    }
  }
}

/**
 * Creates a Boom error.
 *
 * @param  {number} statusCode
 * @param  {string|Error} [message]
 * @param  {any} [data]
 * @return {Boom}
 */
module.exports.createError = function (statusCode, message, data) {
  return new Boom.Boom(message, { statusCode, data })
}
