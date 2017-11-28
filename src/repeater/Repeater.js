// @flow

import type Executor from '../executor/Executor';
import type { StepDescriptor } from '../executor/stepDescriptor';
import type Logger from '../Logger';

import StepException from '../exceptions/StepException';
import RetryException from '../exceptions/RetryException';

import repeatTest from './repeatTest';

export default class Repeater {
  _retryCount: {
    [string]: number,
  };
  _test: () => Generator<StepDescriptor, *, *>;
  _logger: Logger;
  _executor: Executor;

  constructor(
    gen: () => Generator<StepDescriptor, *, *>,
    logger: Logger,
    executor: Executor,
  ) {
    this._test = gen;
    this._retryCount = {};
    this._logger = logger;
    this._executor = executor;
  }

  async run(t: TestCafe$TestController): Promise<?TestCafe$TestController> {
    let g = this._test();
    let v = g.next();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let retryException: ?RetryException = null;

      try {
        await this._executor.run(t, g, v);
      } catch (e) {
        if (!(e instanceof RetryException)) {
          throw e;
        }
        retryException = e;
      }

      if (!retryException) {
        break;
      }

      const possibleSteps = retryException.tos;
      const { origException } = retryException;
      const retries = retryException.retryCount;
      const excludeSteps = retryException.exclude;

      await this._logger.log(t, `Retry exception "${origException.constructor.name}" is caught, retry to some of [${possibleSteps.join(', ')}]`);

      const toStep = await this._processRetry(possibleSteps, origException, retries);
      const returnToStep = this._executor.getHistory()[toStep];

      if (!returnToStep) {
        await this._logger.log(
          t,
          `Retry is not proceed for ${String(toStep)} because it is not found in the already executed steps: [${Object.keys(this._executor.getHistory()).join(', ')}]`,
        );
        // eslint-disable-next-line no-continue
        continue;
      }

      await this._logger.log(t, `Retry proceed, go to "${String(toStep)}"`);

      const returnToStepName = returnToStep.name;
      const returnToStepUrl = returnToStep.url;

      await t.navigateTo(returnToStepUrl);

      [g, v] = repeatTest(this._test(), returnToStepName, excludeSteps);
    }
  }

  async _processRetry(
    tos: Array<string>,
    origException: Error,
    retryCount: number,
  ): Promise<?string> {
    const tosLength = tos.length;
    let fullRetriesCount = 0;
    let toStep: ?string = null;

    for (let i = 0; i < tosLength; i += 1) {
      const key = tos[i] + origException.name;
      const retryCountCurrent = this._retryCount[key] || 0;
      if (retryCountCurrent >= retryCount) {
        fullRetriesCount += retryCountCurrent;
      } else {
        this._retryCount[key] = retryCountCurrent + 1;
        toStep = tos[i];
        break;
      }
    }

    const possibleMaxRetries = retryCount * tosLength;

    // Throw if retries exceed.
    if (fullRetriesCount >= possibleMaxRetries) {
      const msg = ` (after ${possibleMaxRetries} retries to [${tos.join(', ')}] steps)`;

      // Throw cause exception if it present.
      if ((origException instanceof StepException) && origException.throwCauseException) {
        const throwCauseExceptionToRethrow = origException.throwCauseException;

        // If it's TestCafe exception fix error message to be more verbose.
        if (throwCauseExceptionToRethrow.isTestCafeError && throwCauseExceptionToRethrow.errMsg) {
          // $FlowFixMe errMsg is not defined in the Error
          throwCauseExceptionToRethrow.errMsg += msg;
        }

        throw throwCauseExceptionToRethrow;
      }

      // Otherwise throw original exception.
      const origExceptionToRethrow = origException;
      origExceptionToRethrow.message += msg;
      throw origExceptionToRethrow;
    }

    return toStep;
  }
}
