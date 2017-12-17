// @flow

import type Executor from '../executor/Executor';
import type { StepDescriptor } from '../executor/stepDescriptor';
import type Logger from '../Logger';

import DirectorBaseException from '../exceptions/DirectorBaseException';
import RetryException from '../exceptions/RetryException';

import repeatTest from './repeatTest';

export default class Repeater {
  _retryCount: {
    [string]: number,
  };
  _excludeSteps: Set<string>;
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
    this._excludeSteps = new Set();
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

      const {
        possibleSteps,
        throwCauseException,
        retries,
        excludeSteps,
      } = retryException;

      await this._logger.log(t, `Retry exception "${throwCauseException.constructor.name}" is caught, retry to some of [${possibleSteps.join(', ')}]`);

      const toStep = await this._processRetry(possibleSteps, throwCauseException, retries);
      const returnToStep = this._executor.getHistory()[toStep];

      if (!returnToStep) {
        await this._logger.log(
          t,
          `Retry is not proceed for ${String(toStep)} because it is not found in the already executed steps: [${Object.keys(this._executor.getHistory()).join(', ')}]`,
        );
        // eslint-disable-next-line no-continue
        continue;
      }

      await this._logger.log(t, `Retry proceed, go to the "${String(toStep)}" step`);

      const { name, url } = returnToStep;

      await t.navigateTo(url);
      // TODO: add delay
      // https://github.com/DevExpress/testcafe/issues/1978

      excludeSteps.forEach(({ permanent, exclude }) => {
        if (permanent) {
          this._excludeSteps.add(exclude);
        }
      });

      [g, v] = repeatTest(
        this._test(),
        name,
        [...this._excludeSteps, ...excludeSteps.map(e => e.exclude)],
      );
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
      if ((origException instanceof DirectorBaseException) && origException.throwCauseException) {
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
