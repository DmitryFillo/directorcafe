// @flow

let _count = 0;

export default async (t: TestCafe$TestController, returnFromPrevStep: number): Promise<number> => {
  _count += 1;
  await t.expect(_count).eql(1);
  return returnFromPrevStep;
};
