// @flow

export default function DirectorBaseException(message) {
  Error.call(this, message);

  this.name = 'DirectorBaseException';
  this.message = message;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, DirectorBaseException);
  } else {
    this.stack = (new Error()).stack;
  }
}

// NOTE: Inheritance from Error doesn't work with Babel.
DirectorBaseException.prototype = Object.assign(Object.create(Error.prototype), {
  constructor: DirectorBaseException,
  innerException: null,
  setInnerException: function setInnerException(e: ?Error) {
    this.innerException = e;
  },
});
