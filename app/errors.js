const ExtendableError = require('es6-error');

class NoDataFoundError extends ExtendableError {
  constructor(message = 'No data found') {
    super(message);
  }
}

module.exports = { NoDataFoundError };
