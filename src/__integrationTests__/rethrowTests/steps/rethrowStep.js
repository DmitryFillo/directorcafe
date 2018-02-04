// @flow

import { rethrow, DirectorBaseException } from '../../../';

export class BaseTestException extends DirectorBaseException {
  // just for type
}

export default async (t: TestCafe$TestController): Promise<void> => {
  // Throw DirectorBaseException
  try {
    await rethrow(
      t,
      async () => t.expect(false).ok(),
      new BaseTestException(),
    );
  } catch (e) {
    await t.expect(e.innerException.isTestCafeError).ok();
  }

  await t.expect(true).ok();

  // Throw Error()
  try {
    await rethrow(
      t,
      async () => t.expect(false).ok(),
      new Error('test'),
    );
  } catch (e) {
    await t.expect(e.message === 'test').ok();
  }

  // Throw expected type type
  try {
    await rethrow(
      t,
      async () => {
        throw new Error();
      },
      new Error('test'),
      Error,
    );
  } catch (e) {
    await t.expect(e.message === 'test').ok();
  }

  await t.expect(true).ok();
};
