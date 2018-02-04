// @flow

import {
  director,
  step,
} from '../../index';

import constants from './constants';
import rethrowStep from './steps/rethrowStep';
import rethrowNegativeCaseStep from './steps/rethrowNegativeCaseStep';

fixture('Integration tests');

test(
  'Rethrow checks',
  director(function* integrationTest() {
    yield step(
      constants.rethrowStep,
      rethrowStep,
    );

    yield step(
      constants.rethrowNegativeCaseStep,
      rethrowNegativeCaseStep,
    );
  }),
);
