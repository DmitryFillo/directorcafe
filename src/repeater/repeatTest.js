// @flow

import type { StepDescriptor } from '../executor/stepDescriptor';

import moveGen from './utils/moveGen';
import truncateGen from './utils/truncateGen';

export default (
  testGen: Generator<StepDescriptor, *, *>,
  stepName: string,
  excludeSteps: Array<string>,
): [Generator<StepDescriptor, *, *>, StepDescriptor] => {
  type Steps = {
    [string]: null,
  };

  let g = testGen;

  if (excludeSteps && excludeSteps.length > 0) {
    const excludeStepsObj: Steps = excludeSteps.reduce((
      aggregate: Steps,
      next: string,
    ): Steps => {
      const result: Steps = aggregate;
      result[next] = null;
      return result;
    }, ({}: Steps));
    g = truncateGen(
      g,
      (genStep: StepDescriptor) => excludeStepsObj[genStep.name] === null,
    );
  }

  return moveGen(g, (value: StepDescriptor) => value.name === stepName);
};
