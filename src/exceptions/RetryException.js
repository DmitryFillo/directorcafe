// @flow

import type { ExcludeDescriptor } from '../repeater/descriptors/excludeDescriptor';

import BaseException from './BaseException';

export default class RetryException extends BaseException {
  type: (...args: Array<any>) => Error;
  possibleSteps: Array<string>;
  excludeSteps: ?Array<ExcludeDescriptor>;
  retryCount: number;

  constructor(
    type: (...args: Array<any>) => Error,
    possibleSteps: Array<string>,
    retryCount: number,
    excludeSteps: ?Array<ExcludeDescriptor> = null,
    ...args: Array<any>
  ): void {
    if (!possibleSteps) {
      throw new Error('You cannot initialize RetryException without "tos" parameter in the constructor!');
    }
    super(...args);
    this.type = type;
    this.possibleSteps = possibleSteps;
    this.retryCount = retryCount;
    this.excludeSteps = excludeSteps;
  }
}
