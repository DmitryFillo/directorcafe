// @flow

import Executor from './executor/Executor';
import Repeater from './repeater/Repeater';
import Logger from './Logger';

import type { StepDescriptor } from './executor/stepDescriptor';

type ExecutorWrapper = (t: TestCafe$TestController) => Promise<?TestCafe$TestController>;

export default (gen: () => Generator<StepDescriptor, *, *>): ExecutorWrapper => {
  const logger = new Logger();
  const executor = new Executor(logger);
  const repeater = new Repeater(gen, logger, executor);
  return async (t: TestCafe$TestController): Promise<void> => {
    await repeater.run(t);
  };
};
