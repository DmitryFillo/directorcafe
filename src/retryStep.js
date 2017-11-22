// @flow

import type { Step, StepDescriptor } from './descriptors/stepDescriptor';
import type { RetryDescriptor } from './descriptors/retryDescriptor';

import stepFactory from './descriptors/stepDescriptor';
import RetryException from './exceptions/RetryException';

type RetryMap = { [string]: RetryDescriptor };

export default (
  stepDescriptor: StepDescriptor,
  retryDescriptors: Array<RetryDescriptor>,
): StepDescriptor => {
  const { step, name }: { step: Step, name: string } = stepDescriptor;

  const retryMap: RetryMap = retryDescriptors.reduce((
    aggregate: RetryMap,
    next: RetryDescriptor,
  ) => {
    const result: RetryMap = aggregate;
    result[next.type.name] = next;
    return result;
  }, ({}: RetryMap));

  const wrap = async (
    t: TestCafe$TestController,
    { returnFromPrevStep }: { returnFromPrevStep: any },
  ): Promise<any> => {
    let result: any;
    try {
      result = await step(t, returnFromPrevStep);
    } catch (e) {
      const retryDescriptor = retryMap[e.constructor.name];

      if (!retryDescriptor) {
        throw e;
      }

      const {
        type,
        tos,
        maxRetryCount,
        exclude,
      }:
        RetryDescriptor = retryDescriptor;

      throw new RetryException(type, tos, e, maxRetryCount, exclude);
    }
    return result;
  };

  return stepFactory(name, wrap);
};
