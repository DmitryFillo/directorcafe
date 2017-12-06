// @flow

import {
  director,
  step,
  retry,
  exclude,
  retryFor,
} from '../../index';

import constants from './steps/constants';
import countStep from './steps/countStep';
import permanentExcludedStep from './steps/permanentExcludedStep';
import checkPermanentExcludeStep, { ReturnFromPrevStepShouldBeGreaterThanFive } from './steps/checkPermanentExcludeStep';
import rethrowStep, { ReturnFromPrevStepShouldBeGreaterThanThree } from './steps/rethrowUsingReturnValueStep';

fixture('Integration tests');

// TODO: check negative case with excludes
test(
  'Test retry by rethrow internal assertion using return value',
  director(function* integrationTest() {
    yield step(
      constants.count,
      countStep,
    );

    yield step(
      constants.permanentExcludedStep,
      permanentExcludedStep,
    );

    yield retryFor(step(
      constants.rethrowUsingReturnValue,
      rethrowStep,
    ), [
      retry(
        ReturnFromPrevStepShouldBeGreaterThanThree,
        constants.count,
        3,
        [
          exclude(constants.permanentExcludedStep),
        ],
      ),
    ]);

    yield retryFor(step(
      constants.checkPermanentExcludeStep,
      checkPermanentExcludeStep,
    ), [
      retry(
        ReturnFromPrevStepShouldBeGreaterThanFive,
        constants.count,
        1,
        [
          exclude(constants.rethrowUsingReturnValue),
        ],
      ),
    ]);
  }),
);
