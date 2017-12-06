// @flow

import BaseException from '../exceptions/BaseException';

export default async (
  t: TestCafe$TestController,
  assert: () => Promise<any>,
  exception: Error,
  type: ?Error = null,
): Promise<any> => {
  // $FlowFixMe undocumented and no typedef
  const ec = t.executionChain.then();
  const tt = t;
  try {
    return await assert();
  } catch (e) {
    if (type) {
      if (!(e instanceof type)) {
        throw e;
      }
    }
    if (exception instanceof BaseException) {
      exception.setCauseException(e);
    }
  }
  // Hackynote:
  // TestCafe chains promises internally, so we need to remove
  // try-catch-promise from the chain to get rid of new error raising
  tt.executionChain = ec;
  throw exception;
};
