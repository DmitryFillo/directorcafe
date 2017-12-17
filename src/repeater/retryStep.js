// @flow

import type { Step, StepDescriptor } from '../executor/stepDescriptor';
import type { RetryDescriptor } from './descriptors/retryDescriptor';

import stepFactory from '../executor/stepDescriptor';
import RetryException from '../exceptions/RetryException';

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
    returnFromPrevStep: any,
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

      const message = `Retry occurs for ${type.name}. Possible steps: [${tos.join(', ')}]. Exclude steps: [${exclude.map(s => s.exclude).join(', ')}].`;
      const retryException = new RetryException(type, tos, maxRetryCount, exclude, message);
      retryException.setInnerException(e);

      throw retryException;
    }

    return result;
  };

  return stepFactory(name, wrap);
};
