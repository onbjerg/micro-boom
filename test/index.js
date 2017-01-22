import test from 'ava'
import micro from 'micro'
import request from 'request-promise'
import listen from 'test-listen'
import { handleErrors, createError } from '../lib'

/**
 * Utility to wrap a test function in `handleErrors`
 * and `micro`. Returns an URL.
 *
 * @param  {Function} fn The test function to wrap
 * @return {String}      The URL for the served function
 */
const serve = (fn) => {
  return listen(
    micro(handleErrors(fn))
  )
}

/**
 * Utility function to serve a function, catch
 * any errors and test the error against a desired
 * error shape.
 *
 * @param  {Object}   t     ava test suite
 * @param  {Function} fn    Function to wrap
 * @param  {Object}   shape Desired error shape
 * @return {Promise}
 */
const serveAndCatchError = async (t, fn, shape) => {
  const url = await serve(fn)
  try {
    await request(url, { json: true })
  } catch ({ error }) {
    t.deepEqual(error, shape)
  }
}

// Handles generic errors and wraps them in Boom
// NOTE: All HTTP 500 errors have their user
// provided message removed for security reasons.
test('handleErrors, generic', async (t) => {
  await serveAndCatchError(t, async () => {
    throw Error('Whoops')
  }, {
    statusCode: 500,
    message: 'An internal server error occurred',
    error: 'Internal Server Error'
  })
})

test('handleErrors, res.statusCode', async (t) => {
  await serveAndCatchError(t, async (_, res) => {
    res.statusCode = 401
    throw Error('Access denied')
  }, {
    statusCode: 401,
    message: 'Access denied',
    error: 'Unauthorized'
  })
})

test('createError, simple', async (t) => {
  await serveAndCatchError(t, async () => {
    throw createError(501)
  }, {
    statusCode: 501,
    error: 'Not Implemented'
  })
})

test('createError, message', async (t) => {
  await serveAndCatchError(t, async () => {
    throw createError(429, 'Rate limit exceeded')
  }, {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded'
  })
})

test('createError, message w/ data', async (t) => {
  await serveAndCatchError(t, async () => {
    throw createError(400, 'Validation failed', {
      fields: {
        email: 'E-mail is invalid',
        name: 'Name is too short'
      }
    })
  }, {
    statusCode: 400,
    error: 'Bad Request',
    message: 'Validation failed',
    data: {
      fields: {
        email: 'E-mail is invalid',
        name: 'Name is too short'
      }
    }
  })
})
