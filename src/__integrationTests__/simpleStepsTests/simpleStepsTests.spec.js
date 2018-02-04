// @flow

import {
  director,
  step,
} from '../../index';

import constants from './constants';
import simpleReturnStep from './steps/simpleReturnStep';
import simpleCheckReturnValueStep from './steps/simpleCheckReturnValueStep';

fixture('Integration tests');

test(
  'Simple steps test using return value',
  director(function* integrationTest() {
    yield step(
      constants.simpleReturnStep,
      simpleReturnStep,
    );

    yield step(
      constants.simpleCheckReturnValueStep,
      simpleCheckReturnValueStep,
    );
  }),
);
