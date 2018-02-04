// @flow

import { rethrow, DirectorBaseException } from '../../../';

export class ReturnFromPrevStepShouldBeGreaterThanThree extends DirectorBaseException {
  // just for type
}

export default async (t: TestCafe$TestController, returnFromPrevStep: number): Promise<number> => {
  // Rethrow error for assertion using return value from previous step.
  await rethrow(
    t,
    async () => t.expect(returnFromPrevStep).gt(3, 'return from prev step should be greater than 3'),
    new ReturnFromPrevStepShouldBeGreaterThanThree(),
  );
  return returnFromPrevStep;
};
