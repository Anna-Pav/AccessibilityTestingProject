const expose = require('./dist/expose')
module.exports = expose.default
Object.defineProperty(module.exports, 'default', {value: expose.default})
