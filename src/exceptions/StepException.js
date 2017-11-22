// @flow

export default class StepException extends Error {
  throwCauseException: ?Error = null;

  setCauseException(e: ?Error) {
    this.throwCauseException = e;
  }
}
