// @flow

import type { StepDescriptor } from './descriptors/stepDescriptor';
import type Logger from './Logger';

import StepException from './exceptions/StepException';
import RetryException from './exceptions/RetryException';

import replayGenerator from './utils/replayGenerator';
import truncateGenerator from './utils/truncateGenerator';
import getCurrentUrl from './utils/testcafe/getCurrentUrl';

type ExecutorStep = {
  name: string,
  result: any,
  url: string,
};

export default class Executor {
  _steps: {
    [?string]: ExecutorStep,
  };
  _retryCount: {
    [string]: number,
  };
  _test: () => Generator<StepDescriptor, *, *>;
  _logger: Logger;

  constructor(gen: () => Generator<StepDescriptor, *, *>, logger: Logger) {
    this._test = gen;
    this._steps = {};
    this._retryCount = {};
    this._logger = logger;
  }

  async run(t: TestCafe$TestController): Promise<?TestCafe$TestController> {
    let g = this._test();
    let v = g.next();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const retryException: ?RetryException = await this._tryRun(t, g, v);

      if (!retryException) {
        break;
      }

      const possibleSteps = retryException.tos;
      const { origException } = retryException;
      const retries = retryException.retryCount;
      const excludeSteps = retryException.exclude;

      await this._logger.log(t, `Retry exception "${origException.constructor.name}" is caught, retry to some of [${possibleSteps.join(', ')}]`);

      const toStep = await this._processRetry(possibleSteps, origException, retries);
      const returnToStep = this._steps[toStep];

      if (!returnToStep) {
        await this._logger.log(t, `Retry is not proceed for ${String(toStep)} because it is not found in the already executed steps: [${Object.keys(this._steps).join(', ')}]`);
        // eslint-disable-next-line no-continue
        continue;
      }

      await this._logger.log(t, `Retry proceed, go to "${String(toStep)}"`);

      const returnToStepName = returnToStep.name;
      const returnToStepUrl = returnToStep.url;

      await t.navigateTo(returnToStepUrl);

      [g, v] = this._replayTest(returnToStepName, excludeSteps);
    }
  }

  async _tryRun(
    t: TestCafe$TestController,
    g: Generator<*, *, *>,
    v: any,
  ): Promise<?RetryException> {
    let val = v;
    let result: any = null;
    let retryException: ?RetryException = null;

    while (!val.done) {
      const { name, step }: StepDescriptor = val.value;

      const url: string = await getCurrentUrl();

      this._steps[name] = ({
        step,
        name,
        result: null,
        url,
      }: ExecutorStep);

      await this._logger.log(t, `${name}: before`);

      try {
        result = await step(t, {
          returnFromPrevStep: result,
        });
      } catch (e) {
        if (!(e instanceof RetryException)) {
          throw e;
        }
        retryException = e;
        break;
      }

      await this._logger.log(t, `${name}: after`);

      this._steps[name].result = result;

      val = g.next();
    }

    return retryException;
  }

  _replayTest(
    stepName: string,
    excludeSteps: Array<string>,
  ): [Generator<StepDescriptor, *, *>, StepDescriptor] {
    type Steps = {
      [string]: null,
    };

    let g = this._test();

    if (excludeSteps && excludeSteps.length > 0) {
      const excludeStepsObj: Steps = excludeSteps.reduce((
        aggregate: Steps,
        next: string,
      ): Steps => {
        const result: Steps = aggregate;
        result[next] = null;
        return result;
      }, ({}: Steps));
      g = truncateGenerator(
        g,
        (genStep: StepDescriptor) => excludeStepsObj[genStep.name] === null,
      );
    }

    return replayGenerator(g, (value: StepDescriptor) => value.name === stepName);
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
