// @flow

import { director, step, retryStep, retryDescriptor } from '../../index';

import constants from './steps/constants';
import countStep from './steps/countStep';
import rethrowStep, { ReturnFromPrevStepShouldBeGreaterThanThree } from './steps/rethrowUsingReturnValueStep';

fixture('Integration tests');

test('Test retry by rethrow internal assertion using return value', director(function* integrationTest() {
  yield step(
    constants.count,
    countStep,
  );

  yield retryStep(step(
    constants.rethrowUsingReturnValue,
    rethrowStep,
  ), [
    retryDescriptor(
      ReturnFromPrevStepShouldBeGreaterThanThree,
      constants.count,
      3,
    ),
  ]);
}));
