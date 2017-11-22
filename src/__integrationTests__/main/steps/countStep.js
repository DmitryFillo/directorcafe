// @flow

let _count = 0;

export default async (t: TestCafe$TestController): Promise<number> => {
  await t.expect(true).ok('just simple assert');
  _count += 1;
  return _count;
};
