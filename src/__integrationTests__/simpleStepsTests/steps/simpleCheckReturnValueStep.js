// @flow

export default async (t: TestCafe$TestController, returnFromPrevStep: number): Promise<void> => {
  await t.expect(returnFromPrevStep).eql(10, 'Assert is OK');
};
