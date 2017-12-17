// @flow

import type { StepDescriptor } from './stepDescriptor';
import type Logger from '../Logger';

import getCurrentUrl from '../testcafe/getCurrentUrl';

export type ExecutorStep = {
  name: string,
  result: any,
  url: string,
};

type StepsQueue = {
  [?string]: ExecutorStep,
};

export default class Executor {
  _steps: StepsQueue;
  _logger: Logger;

  constructor(logger: Logger) {
    this._steps = {};
    this._logger = logger;
  }

  async run(
    t: TestCafe$TestController,
    g: Generator<StepDescriptor, *, *>,
    v: any,
  ): Promise<void> {
    let val = v;
    let result: any = null;

    while (!val.done) {
      const stepDescriptor = val.value;
      const { name, step }: StepDescriptor = stepDescriptor;

      const url: string = await getCurrentUrl();

      this._steps[name] = ({
        step,
        name,
        result: null,
        url,
      }: ExecutorStep);

      result = await this._executor(t, stepDescriptor, result);

      this._steps[name].result = result;

      val = g.next();
    }
  }

  getHistory(): StepsQueue {
    return this._steps;
  }

  async _execute(
    t: TestCafe$TestController,
    stepDescriptor: StepDescriptor,
    prevResult: any,
  ): Promise<any> {
    const { name, step }: StepDescriptor = stepDescriptor;

    await this._logger.log(t, `${name}: before`);
    const result = await step(t, prevResult);
    await this._logger.log(t, `${name}: after`);

    return result;
  }
}
