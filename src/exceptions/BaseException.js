// @flow

export default class BaseException extends Error {
  throwCauseException: ?Error = null;

  setCauseException(e: ?Error) {
    this.throwCauseException = e;
  }
}
