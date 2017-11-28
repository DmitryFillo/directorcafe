// @flow

import type { StepDescriptor } from './stepDescriptor';
import type Logger from '../Logger';

import getCurrentUrl from '../testcafe/getCurrentUrl';

type StepsQueue = {
  [?string]: ExecutorStep,
};

export type ExecutorStep = {
  name: string,
  result: any,
  url: string,
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
      const { name, step }: StepDescriptor = val.value;

      const url: string = await getCurrentUrl();

      this._steps[name] = ({
        step,
        name,
        result: null,
        url,
      }: ExecutorStep);

      // TODO: extract method?
      await this._logger.log(t, `${name}: before`);

      result = await step(t, result);

      await this._logger.log(t, `${name}: after`);

      this._steps[name].result = result;

      val = g.next();
    }
  }

  getHistory(): StepsQueue {
    return this._steps;
  }
}
