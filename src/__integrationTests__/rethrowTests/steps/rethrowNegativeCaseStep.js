// @flow

import { rethrow } from '../../../';

export default async (t: TestCafe$TestController): Promise<void> => {
  await t.expect(true).ok();

  // Throw unexpected type type
  try {
    await rethrow(
      t,
      async () => t.expect(false).ok(),
      new Error('test'),
      Error,
    );
  } catch (e) {
    await t.expect(e.isTestCafeError).ok();
  }

  await t.expect(true).ok();
};
