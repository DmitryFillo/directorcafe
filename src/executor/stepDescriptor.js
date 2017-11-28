// @flow

export type StepTest = (...args: Array<any>)
  => Promise<any>;

export type Step = (t: TestCafe$TestController, returnFromPrevStep: any)
  => Promise<any>;

export type StepDescriptor = {
  name: string,
  step: Step,
}

export default (name: string, step: StepTest, ...argsToInject: Array<any>): StepDescriptor => {
  if (name === undefined || step === undefined) {
    throw new Error('You should pass name, step to the stepDescriptor!');
  }
  return {
    name,
    step: async (
      t: TestCafe$TestController,
      returnFromPrevStep: any,
    ) => step(...argsToInject, t, returnFromPrevStep),
  };
};
