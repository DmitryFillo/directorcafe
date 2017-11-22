// @flow

import { rethrows, StepException } from '../../../';

export class ReturnFromPrevStepShouldBeGreaterThanThree extends StepException {
  // just for type
}

export default async (t: TestCafe$TestController, returnFromPrevStep: number): Promise<void> => {
  // Rethrow error for assertion using return value from previous step.
  await rethrows(
    t,
    async () => t.expect(returnFromPrevStep).gt(3, 'return from prev step should be greater than 3'),
    new ReturnFromPrevStepShouldBeGreaterThanThree(),
  );
};
