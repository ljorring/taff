
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./taff.cjs.production.min.js')
} else {
  module.exports = require('./taff.cjs.development.js')
}
