# `micro-boom` [![NPM](https://img.shields.io/npm/v/micro-boom.svg?style=flat)](https://www.npmjs.org/package/micro-boom) [![travis-ci](https://travis-ci.org/onbjerg/micro-boom.svg?branch=master)](https://travis-ci.org/onbjerg/micro-boom) [![Greenkeeper](https://badges.greenkeeper.io/onbjerg/micro-boom.svg)](https://greenkeeper.io/)

Wraps errors in [`micro`](https://github.com/zeit/micro) services [`Boom`](https://github.com/hapijs/boom) errors.

**Example Responses**

```json
{
  "error": "Unauthorized", 
  "message": "Not authenticated", 
  "statusCode": 401
}
```

```json
{
  "data": {
    "reason": "Username is wrong"
  }, 
  "error": "Unauthorized", 
  "message": "Not authenticated", 
  "statusCode": 401
}
```

---

## Installation

```sh
npm install --save micro-boom
```

Or even better

```sh
yarn add micro-boom
```

## Import and Usage Example

```js
const { handleErrors, createError } = require('micro-boom')

module.exports = handleErrors(async function (req, res) {
  throw createError(401, 'Not authenticated', {
    reason: 'Bad password'
  })
})
```

## API

#### handleErrors

Catches error from an async function, wraps them in a Boom error object and generates a JSON response.

The status code of an error is determined by three factors, in order:

- Status code is set to `err.output.statusCode`
- If not set, error is inferred from `res.statusCode`
- Default to HTTP 500 (also defaults to HTTP 500 if status is < 400)

> :rotating_light: **TAKE NOTE** :rotating_light:  
> All HTTP 500 errors have their user provided message removed for security reasons.

**Parameters**

-   `fn` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** Async function, your normal `micro` logic.
-   `dump` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Optional. Dumps `err.stack` to `stderr` if true

**Examples**

```js
const { handleErrors } = require('micro-boom')

// Returns HTTP 500
module.exports = handleErrors(async function (req, res) {
  throw Error('Uh-oh, something bad happened.')
})
```

```js
const { handleErrors } = require('micro-boom')

// Returns HTTP 401
module.exports = handleErrors(async function (req, res) {
  res.statusCode = 401
  throw Error('Unauthorized')
})
```

Returns an async **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)**.

#### createError

Alias for [`Boom#create(statusCode, [message], [data])`](https://github.com/hapijs/boom#createstatuscode-message-data).

**Parameters**

-   `statusCode` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** HTTP status code, must be >= 400
-   `message` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** An optional error message.
-   `message` **[Any]** Some optional error metadata, serialized with [``JSON.stringify``](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

**Examples**

```js
const { handleErrors, createError } = require('micro-boom')

// Message defaults to what corresponds to the HTTP error code
module.exports = handleErrors(async function (req, res) {
  throw createError(500)
})
```

```js
const { handleErrors, createError } = require('micro-boom')

// HTTP 401: Unauthorized
module.exports = handleErrors(async function (req, res) {
  throw createError(401, 'Unauthorized')
})
```

```js
const { handleErrors, createError } = require('micro-boom')

// HTTP 401: Unauthorized with metadata,
// set in `.data` of the response.
module.exports = handleErrors(async function (req, res) {
  throw createError(401, 'Unauthorized', {
    reason: 'Bad password',
    foo: 'bar'
  })
})
```

Returns an async **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)**.
