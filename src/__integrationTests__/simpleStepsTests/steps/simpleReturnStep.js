// @flow

export default async (t: TestCafe$TestController): Promise<number> => {
  await t.expect(true).ok('just simple assert');
  return 10;
};
