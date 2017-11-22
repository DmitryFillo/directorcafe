// @flow

export default class RetryException extends Error {
  type: (...args: Array<any>) => Error;
  tos: Array<string>;
  exclude: Array<string>;
  origException: Error;
  retryCount: number;

  constructor(
    type: (...args: Array<any>) => Error,
    tos: Array<string>,
    origException: Error,
    retryCount: number,
    exclude: Array<string>,
  ): void {
    if (!tos) {
      throw new Error('You cannot initialize RetryException without "tos" parameter in the constructor!');
    }
    const message: string = `RetryException occurred by ${origException.name}. Going to the [${tos.join(', ')}] steps. Excluding [${exclude.join(', ')}] steps.`;
    super(message);
    this.type = type;
    this.tos = tos;
    this.retryCount = retryCount;
    this.exclude = exclude;
    this.origException = origException;
  }
}
