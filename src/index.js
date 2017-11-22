// @flow

import Executor from './Executor';
import Logger from './Logger';

import type { StepDescriptor } from './descriptors/stepDescriptor';

type ExecutorWrapper = (t: TestCafe$TestController) => Promise<?TestCafe$TestController>;

export const director =
  (gen: () => Generator<StepDescriptor, *, *>): ExecutorWrapper => {
    const executor: Executor = new Executor(gen, new Logger());
    return async (t: TestCafe$TestController): Promise<void> => {
      await t.maximizeWindow();
      await executor.run(t);
    };
  };

export { default as step } from './descriptors/stepDescriptor';
export { default as retryDescriptor } from './descriptors/retryDescriptor';
export { default as retryStep } from './retryStep';
export { default as StepException } from './exceptions/StepException';
export { default as rethrows } from './utils/testcafe/testControllerThrows';
export { default as getCurrentUrl } from './utils/testcafe/getCurrentUrl';
