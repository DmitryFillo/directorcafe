// @flow

import { rethrow, BaseException } from '../../../';

export class ReturnFromPrevStepShouldBeGreaterThanFive extends BaseException {
  // just for type
}

export default async (t: TestCafe$TestController, returnFromPrevStep: number): Promise<void> => {
  // Rethrow error for assertion using return value from previous step.
  await rethrow(
    t,
    async () => t.expect(returnFromPrevStep).gt(5, 'return from prev step should be greater than 5'),
    new ReturnFromPrevStepShouldBeGreaterThanFive(),
  );
};
