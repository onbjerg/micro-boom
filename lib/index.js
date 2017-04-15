const { send } = require('micro')
const Boom = require('boom')

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
      let status = res.statusCode || 500
      if (err.isBoom) {
        status = err.output.statusCode
      }

      // Since it's an error, it's safe to assume <400
      // status codes are a mistake.
      if (status < 400) {
        status = 500
      }

      // Wrap the error and generate the response
      const error = err.isBoom ? Boom.wrap(err) : Boom.wrap(err, status)
      send(
        res,
        status,
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
 * @type {@link module:Boom.create}
 */
module.exports.createError = Boom.create
