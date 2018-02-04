// @flow

import type { ExcludeDescriptor } from '../repeater/descriptors/excludeDescriptor';

import DirectorBaseException from './DirectorBaseException';

export default class RetryException extends DirectorBaseException {
  type: (...args: Array<any>) => Error;
  possibleSteps: Array<string>;
  excludeSteps: ?Array<ExcludeDescriptor>;
  retryCount: number;

  constructor(
    type: (...args: Array<any>) => Error,
    message: string,
    possibleSteps: Array<string>,
    retryCount: number,
    excludeSteps: ?Array<ExcludeDescriptor> = null,
  ): void {
    super(message);
    this.name = 'RetryException';
    this.type = type;
    this.possibleSteps = possibleSteps;
    this.retryCount = retryCount;
    this.excludeSteps = excludeSteps;
  }
}
